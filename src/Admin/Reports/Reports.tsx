import { BarChart3, TrendingUp, PieChart, Download } from 'lucide-react';

export function Reports() {
  const reportCards = [
    { title: 'Loan Disbursement', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Collection Efficiency', icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Customer Growth', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase">Financial Reports</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Analyze your shop's performance and collection metrics.</p>
        </div>
        <button className="bg-[#1b88f3] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors">
          <Download className="w-5 h-5" />
          Export All Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center mb-4`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
            <p className="text-sm text-gray-500 mt-1">Generate detailed analytics for {card.title.toLowerCase()}.</p>
            <div className="mt-4 flex items-center text-[#1b88f3] text-sm font-semibold">
              View Report →
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-gray-50 p-6 rounded-full mb-4">
          <BarChart3 className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Advanced Analytics Hub</h2>
        <p className="text-gray-500 text-center max-w-sm mt-2">
            Detailed interactive charts and data visualizations are currently being prepared for your shop. 
            Check back soon for more insights!
        </p>
      </div>
    </div>
  );
}
