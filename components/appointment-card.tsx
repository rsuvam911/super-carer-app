interface AppointmentCardProps {
  name: string
  date: string
  description: string
}

export default function AppointmentCard({ name, date, description }: AppointmentCardProps) {
  return (
    <div className="bg-[#FFFBF2] rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
          <span className="text-xs font-medium">CW</span>
        </div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">Description</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      <div className="flex space-x-2">
        <button className="bg-[#00C2CB] text-white text-xs py-1 px-3 rounded-md">Accept</button>
        <button className="bg-red-500 text-white text-xs py-1 px-3 rounded-md">Reject</button>
      </div>
    </div>
  )
}

