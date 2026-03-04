import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import xlsx from 'xlsx';

const workspaceRoot = process.cwd();
const reportsDir = path.join(workspaceRoot, 'reports');
const vitestJsonPath = path.join(reportsDir, 'vitest-results.json');
const excelReportPath = path.join(reportsDir, 'test-report.xlsx');

const runVitest = () =>
  new Promise((resolve) => {
    const vitestCliPath = path.join(workspaceRoot, 'node_modules', 'vitest', 'vitest.mjs');
    const child = spawn(
      process.execPath,
      [
        vitestCliPath,
        'run',
        '--reporter=verbose',
        '--reporter=json',
        `--outputFile=${vitestJsonPath}`,
      ],
      {
        stdio: 'inherit',
        shell: false,
      }
    );

    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });

const toRows = (result) => {
  const suites = Array.isArray(result?.testResults) ? result.testResults : [];
  const rows = [];

  for (const suite of suites) {
    const suiteName = suite.name || suite.file || 'Unknown suite';
    const suiteFile = suite.file || suite.name || 'N/A';
    const assertions = Array.isArray(suite.assertionResults) ? suite.assertionResults : [];

    if (assertions.length === 0) {
      rows.push({
        'Test About': suiteName,
        Status: suite.status || 'unknown',
        Reason: 'No assertion details available',
        'Next Steps Triggered': suite.status === 'passed' ? 'Yes' : 'No',
        Suite: suiteName,
        File: suiteFile,
      });
      continue;
    }

    for (const assertion of assertions) {
      const status = assertion.status || 'unknown';
      const fullName = assertion.fullName || assertion.title || assertion.name || 'Unnamed test';
      const failureMessages = Array.isArray(assertion.failureMessages)
        ? assertion.failureMessages
        : [];
      const reason =
        status === 'passed'
          ? 'N/A'
          : failureMessages.length > 0
          ? failureMessages.join('\n\n').slice(0, 2000)
          : 'Assertion failed without detailed message';

      rows.push({
        'Test About': fullName,
        Status: status,
        Reason: reason,
        'Next Steps Triggered': status === 'passed' ? 'Yes' : 'No',
        Suite: suiteName,
        File: suiteFile,
      });
    }
  }

  return rows;
};

const createWorkbook = (rows, result) => {
  const workbook = xlsx.utils.book_new();

  const summaryRows = [
    { Metric: 'Generated At', Value: new Date().toISOString() },
    { Metric: 'Total Tests', Value: result?.numTotalTests ?? rows.length },
    { Metric: 'Passed', Value: result?.numPassedTests ?? rows.filter((r) => r.Status === 'passed').length },
    { Metric: 'Failed', Value: result?.numFailedTests ?? rows.filter((r) => r.Status === 'failed').length },
    { Metric: 'Skipped', Value: result?.numPendingTests ?? rows.filter((r) => r.Status === 'pending').length },
  ];

  const summarySheet = xlsx.utils.json_to_sheet(summaryRows);
  xlsx.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const detailsSheet = xlsx.utils.json_to_sheet(rows);
  detailsSheet['!cols'] = [
    { wch: 60 },
    { wch: 12 },
    { wch: 90 },
    { wch: 20 },
    { wch: 40 },
    { wch: 45 },
  ];
  xlsx.utils.book_append_sheet(workbook, detailsSheet, 'Test Results');

  try {
    xlsx.writeFile(workbook, excelReportPath);
    return excelReportPath;
  } catch (error) {
    if (error && (error.code === 'EBUSY' || error.code === 'EPERM')) {
      const fallbackPath = path.join(
        reportsDir,
        `test-report-${Date.now()}.xlsx`
      );
      xlsx.writeFile(workbook, fallbackPath);
      console.warn(
        `Primary report file is locked (${excelReportPath}). Wrote fallback report: ${fallbackPath}`
      );
      return fallbackPath;
    }
    throw error;
  }
};

const main = async () => {
  await fs.mkdir(reportsDir, { recursive: true });

  const exitCode = await runVitest();

  let parsed = {
    numTotalTests: 0,
    numPassedTests: 0,
    numFailedTests: 0,
    numPendingTests: 0,
    testResults: [],
  };

  try {
    const raw = await fs.readFile(vitestJsonPath, 'utf8');
    parsed = JSON.parse(raw);
  } catch {
    parsed = {
      ...parsed,
      testResults: [
        {
          name: 'Vitest execution',
          file: 'N/A',
          status: 'failed',
          assertionResults: [
            {
              status: 'failed',
              fullName: 'Vitest JSON output generation',
              failureMessages: ['Could not parse vitest-results.json'],
            },
          ],
        },
      ],
      numTotalTests: 1,
      numFailedTests: 1,
    };
  }

  const rows = toRows(parsed);
  const writtenReportPath = createWorkbook(rows, parsed);

  console.log(`Excel report generated: ${writtenReportPath}`);
  process.exit(exitCode);
};

main();
