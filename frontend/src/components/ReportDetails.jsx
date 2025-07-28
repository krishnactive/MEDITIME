import React from 'react';
import { FaVial, FaNotesMedical } from 'react-icons/fa';
import { MdOutlineHealthAndSafety } from 'react-icons/md';

const ReportDetails = ({ data }) => {
  let structuredData = null;
  let patientAdvice = '';

  try {
    const firstBrace = data.aiSummary.indexOf('{');
    const lastBrace = data.aiSummary.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonText = data.aiSummary.substring(firstBrace, lastBrace + 1);
      structuredData = JSON.parse(jsonText);
      patientAdvice = data.aiSummary.substring(lastBrace + 1).trim();
    } else {
      patientAdvice = data.aiSummary;
    }
  } catch (error) {
    console.error('Failed to parse structured data:', error);
    patientAdvice = data.aiSummary;
  }

  const tests = structuredData?.tests || [];

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 space-y-6">
      
      <div>
        <div className="flex items-center mb-3 text-blue-700 font-semibold text-lg">
          <FaVial className="mr-2" />
          Extracted Report Details
        </div>
        {tests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border px-3 py-2">Test</th>
                  <th className="border px-3 py-2">Result</th>
                  <th className="border px-3 py-2">Reference Range</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition">
                    <td className="border px-3 py-2">{test.testName || '-'}</td>
                    <td className="border px-3 py-2">{test.result || '-'}</td>
                    <td className="border px-3 py-2">{test.range || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-start text-gray-600 bg-gray-50 border rounded p-3">
            <FaNotesMedical className="mr-2 mt-1 text-gray-500" />
            <pre className="whitespace-pre-wrap text-sm">{data.cleanedText || 'No report text extracted.'}</pre>
          </div>
        )}
      </div>

      {patientAdvice && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <div className="flex items-center text-green-700 font-semibold mb-2">
            <MdOutlineHealthAndSafety className="mr-2" />
            Patient Instructions & Next Steps
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{patientAdvice}</p>
        </div>
      )}
    </div>
  );
};

export default ReportDetails;
