import { Filter, Search } from 'lucide-react'

const transactions = [
  {
    id: 1,
    type: 'earning',
    amount: 25.5,
    description: 'Image Classification - Batch #142',
    date: '2025-09-19',
    status: 'completed',
  },
  {
    id: 2,
    type: 'withdrawal',
    amount: -300.0,
    description: 'Withdrawal to Chase Bank',
    date: '2025-09-15',
    status: 'completed',
  },
  {
    id: 3,
    type: 'earning',
    amount: 18.75,
    description: 'Text Annotation - Project Alpha',
    date: '2025-09-18',
    status: 'completed',
  },
  {
    id: 4,
    type: 'earning',
    amount: 42.25,
    description: 'Object Detection - Dataset V2',
    date: '2025-09-17',
    status: 'pending',
  },
  {
    id: 5,
    type: 'withdrawal',
    amount: -150.0,
    description: 'Withdrawal to Bank of America',
    date: '2025-09-10',
    status: 'completed',
  },
  {
    id: 6,
    type: 'earning',
    amount: 33.0,
    description: 'Sentiment Analysis - Customer Reviews',
    date: '2025-09-16',
    status: 'completed',
  },
]

export const TransactionsContent = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-white">
          Transaction History
        </h1>
        <p className="text-gray-400">
          View all your earnings and withdrawal activities
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 text-white transition-colors hover:bg-gray-600">
          <Filter size={16} />
          Filter
        </button>
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            className="rounded-lg border border-gray-600 bg-gray-700 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>
      </div>
    </div>

    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="transition-colors hover:bg-gray-700/50"
              >
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      transaction.type === 'earning'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {transaction.type === 'earning' ? 'Earning' : 'Withdrawal'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  <span
                    className={
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    {transaction.amount > 0 ? '+' : ''}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      transaction.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {transaction.status === 'completed'
                      ? 'Completed'
                      : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)
