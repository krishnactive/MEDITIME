import React from 'react';

const ReportDetails = ({ data }) => {
  return (
    <div className="p-4 border rounded bg-gray-50 mt-4">
      <h3 className="font-semibold mb-2">Extracted Report Details</h3>
      {data.structuredData ? (
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Test</th>
              <th className="border px-2 py-1">Result</th>
              <th className="border px-2 py-1">Reference Range</th>
            </tr>
          </thead>
          <tbody>
            {data.structuredData.map((item, index) => (
              <tr key={index}>
                <td className="border px-2 py-1">{item.testName}</td>
                <td className="border px-2 py-1">{item.result}</td>
                <td className="border px-2 py-1">{item.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <pre className="whitespace-pre-wrap">{data.extractedText}</pre>
      )}
    </div>
  );
};

export default ReportDetails;
