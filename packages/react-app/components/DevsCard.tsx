'use-client'
import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

const DevsCard = () => {
  const { status, data: session } = useSession();
  console.log(session?.user?.image);

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
          <a href="" className="rounded-full border border-black bg-black px-5 py-2 text-sm text-white shadow-lg transition-all hover:bg-white hover:text-black">
            Create Masa domain
          </a>
          
          
          <a href="/" className="flex items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-5 py-2 shadow-lg transition-all hover:border-gray-800" target="_blank" rel="noreferrer" >
            <p className="text-sm">Register Attestation</p>
          </a>
          
        </div>
        </div>

        
      </div>

     
    </div>
  );
};

export default DevsCard;