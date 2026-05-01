import { useState, useEffect } from "react";

export default function Report() {
  const [years, setYears] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function filter() {
      const response = await fetch("https://cs348project-b5vn.onrender.com/record/report/stats");
      //const response = await fetch("http://localhost:5050/record/report/stats");
      const results = await response.json();
      setPositions(results.positions);
      setYears(results.years);
    }
    filter();
  }, []);

  async function generateReport(e) {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams({
      year: selectedYear,
      position: selectedPosition,
    });
    // Populate report:
    const response = await fetch(`https://cs348project-b5vn.onrender.com/record/report/stats?${params}`);
    //const response = await fetch(`http://localhost:5050/record/report/stats?${params}`);
    const results = await response.json();
    setReport(results);
    // End populate report
    setLoading(false);
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Member Report</h3>

      <form onSubmit={generateReport} className="border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="block w-full rounded-md border border-slate-300 py-1.5 px-2 text-slate-900 sm:text-sm"
            >
              <option value="All">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="block w-full rounded-md border border-slate-300 py-1.5 px-2 text-slate-900 sm:text-sm"
            >
              <option value="All">All Positions</option>
              {positions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 inline-flex items-center justify-center border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3 text-sm font-medium"
        >
          Generate Report
        </button>
      </form>

      {loading && <p className="text-slate-500">Loading...</p>}

      {report && !loading && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{report.total}</p>
              <p className="text-sm text-slate-600">Total Members</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{Object.keys(report.yearCounts).length}</p>
              <p className="text-sm text-slate-600">Year Groups</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{Object.keys(report.positionCounts).length}</p>
              <p className="text-sm text-slate-600">Unique Positions</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-base font-semibold mb-2">Breakdown by Year</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Year</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Count</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.yearCounts).map(([year, count]) => (
                    <tr key={year} className="border-b">
                      <td className="px-4 py-2">{year}</td>
                      <td className="px-4 py-2">{count}</td>
                      <td className="px-4 py-2">
                        {report.total > 0 ? ((count / report.total) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-base font-semibold mb-2">Breakdown by Position</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Position</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Count</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.positionCounts).map(([pos, count]) => (
                    <tr key={pos} className="border-b">
                      <td className="px-4 py-2">{pos}</td>
                      <td className="px-4 py-2">{count}</td>
                      <td className="px-4 py-2">
                        {report.total > 0 ? ((count / report.total) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-2">Matching Members</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Position</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {report.records.map((member) => (
                    <tr key={member._id} className="border-b">
                      <td className="px-4 py-2">{member.name}</td>
                      <td className="px-4 py-2">{member.position}</td>
                      <td className="px-4 py-2">{member.year}</td>
                    </tr>
                  ))}
                  {report.records.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-4 text-center text-slate-400">
                        No members match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
