'use-client'
import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Modal from "./Modal";
import { Masa } from "@masa-finance/masa-sdk";



const DevsCard = () => {
  const { status, data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [soulname, setSoulname] = useState("");
  const [availability, setAvailabity] = useState(true)
  const [loadingAvailabity, setLoadingAvailability] = useState(false)

  return (
    <div className='prompt_card'>
      <div className='flex justify-between items-start gap-5'>
        <div >
        <div
          className='flex-1 flex justify-start items-center gap-3 cursor-pointer'
          
        >
          <Image
            src={session?.user?.image}
            alt='github_image'
            width={40}
            height={40}
            className='rounded-full object-contain'
          />

          <div className='flex flex-col'>
            <h3 className='font-satoshi font-semibold text-gray-900'>
              {session?.user?.name}
            </h3>
            <p className='font-inter text-sm text-gray-500'>
             {session?.user?.email}
            </p>
          </div>
          
        </div>
        <div className="mx-auto mt-5 flex max-w-fit space-x-4" >

            <button className="rounded-full border border-black bg-black px-5 py-2 text-sm text-white shadow-lg transition-all hover:bg-white hover:text-black" onClick={() => setShowModal(true)}>
              Create Masa Soulname
            </button>
          
          <a href="/" className="flex items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-5 py-2 shadow-lg transition-all hover:border-gray-800" target="_blank" rel="noreferrer" >
            <p className="text-sm">Register Attestation</p>
          </a>
          
        </div>
        </div>

        
      </div>

     <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
      <div className="py-6 px-6 lg:px-8 text-left">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Register Soulname (.celo)</h3>
        <form className="space-y-6 " action="#">
          <div>
            <label htmlFor="soul name" className="block mb-2 text-sm font-medium text-gray-900">
              Search Soulnames
            </label>
            <input
              type="text"
              name="soulname"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <button className="w-full text-white bg-blue-700 hover:bg-black focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg">
            Create Soulname
          </button>
        </form>
      </div>
     </Modal>
    </div>

  );
};

export default DevsCard;