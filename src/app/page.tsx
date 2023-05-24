import ImageDropper from "@/components/ImageDropper"
import { useState } from "react"

export default function Home() {
  return (
    <div className='grid grid-cols-12 h-full min-h-screen'>
      <div className='col-span-12 md:col-span-9 border-r border-slate-800 h-full'>
        <div className="p-4">
          Image
          <ImageDropper />
        </div>
      </div>
      <div className='col-span-12 md:col-span-3 h-full'>
        <div className="p-4">
          Controls
        </div>
      </div>
    </div>
  )
}


