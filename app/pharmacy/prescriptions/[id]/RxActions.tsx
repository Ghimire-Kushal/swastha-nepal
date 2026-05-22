'use client'

import { useActionState } from 'react'
import { verifyPrescription, dispensePrescription } from '@/app/actions/pharmacy'
import { CheckCircle, PackageCheck } from 'lucide-react'

export default function RxActions({
  prescriptionId,
  status,
}: {
  prescriptionId: string
  status: string
}) {
  const [verifyState, verifyAction] = useActionState(verifyPrescription, undefined)
  const [dispenseState, dispenseAction] = useActionState(dispensePrescription, undefined)

  return (
    <div className="print:hidden space-y-3">
      {verifyState?.success && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-blue-700 text-sm font-medium">
          {verifyState.message}
        </div>
      )}
      {verifyState && !verifyState.success && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm">
          {verifyState.error}
        </div>
      )}
      {dispenseState?.success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-emerald-700 text-sm font-medium">
          {dispenseState.message}
        </div>
      )}
      {dispenseState && !dispenseState.success && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm">
          {dispenseState.error}
        </div>
      )}

      {status === 'active' && (
        <form action={dispenseAction}>
          <input type="hidden" name="prescriptionId" value={prescriptionId} />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <PackageCheck className="w-5 h-5" />
            Mark as Dispensed
          </button>
        </form>
      )}

      {(status === 'active' || status === 'dispensed') && (
        <form action={verifyAction}>
          <input type="hidden" name="prescriptionId" value={prescriptionId} />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Add Verification Note
          </button>
        </form>
      )}
    </div>
  )
}
