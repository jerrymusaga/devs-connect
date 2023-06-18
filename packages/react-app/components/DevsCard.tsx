import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Modal from "./Modal";
import { Masa } from "@masa-finance/masa-sdk";
import { providers } from "ethers";
import toast, { Toaster } from "react-hot-toast";

import { 
  ALFAJORES_CUSD_ADDRESS,
  ALFAJORES_RPC,
  FA_PROXY_ADDRESS,
  FA_CONTRACT,
  ODIS_PAYMENTS_PROXY_ADDRESS,
  ODIS_PAYMENTS_CONTRACT,
  STABLE_TOKEN_CONTRACT,
  ISSUER_PRIVATE_KEY,
  DEK_PRIVATE_KEY,

} from "@/utils/constants";
import { OdisUtils } from "@celo/identity";
import { AuthenticationMethod, AuthSigner, OdisContextName } from "@celo/identity/lib/odis/query";
import { ethers, Wallet } from "ethers";
import WebBlsBlindingClient, { BlsBlindingClient } from "@/utils/bls-blinding-client";
import { parseEther } from "viem";
import { LockOpenIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useAccount, useSendTransaction } from "wagmi";
import { ISocialConnect } from "@/utils/ISocialConnect";
import { isMounted } from "@/hooks/useIsMounted";
import { getObfuscatedIdentifier } from "@celo/identity/lib/odis/identifier";

const DevsCard = () => {
  //social connect

  let iMounted = isMounted();

  
    let [sc, setSc] = useState<ISocialConnect>();

    //step 1- get the connected wallet address
    let {address} = useAccount();

    //step 2- session fro github and resolution of social identifier
    const { data: session } = useSession();
    let [socialIdentifier, setSocialIdentifier] = useState('');

    //step 3- identifier and address to send value
    let [identifierToSendTo, setIdentifierToSendTo] = useState("");
    let [addressToSendTo, setAddressToSendTo] = useState("");

    useEffect(() => {
      let provider = new ethers.providers.JsonRpcProvider(ALFAJORES_RPC);
      let issuer = new Wallet(ISSUER_PRIVATE_KEY!, provider);
      let serviceContext = OdisUtils.Query.getServiceContext(OdisContextName.ALFAJORES);
      let blindingClient = new WebBlsBlindingClient(serviceContext.odisPubKey);
      let quotaFee = ethers.utils.parseEther('0.01');
      let authSigner: AuthSigner = {
        authenticationMethod: AuthenticationMethod.ENCRYPTION_KEY,
        rawKey: DEK_PRIVATE_KEY!
      }; 
      let federatedAttestationsContract = new ethers.Contract(
        FA_PROXY_ADDRESS!,
        FA_CONTRACT.abi,
        issuer
      );
      let odisPaymentsContract = new ethers.Contract(
        ODIS_PAYMENTS_PROXY_ADDRESS!,
        ODIS_PAYMENTS_CONTRACT.abi,
        issuer
      );
      let stableTokenContract = new ethers.Contract(
        ALFAJORES_CUSD_ADDRESS!,
        STABLE_TOKEN_CONTRACT.abi,
        issuer
      );
      let sCVars: ISocialConnect = {
        issuerAddress: issuer.address,
        federatedAttestationsContract,
        odisPaymentsContract,
        stableTokenContract,
        authSigner,
        serviceContext,
        quotaFee,
        blindingClient
      };
      setSc(sCVars);
    }, [])

    useEffect(() => {
      // @ts-ignore: session was customized
      session && session?.user?.name && setSocialIdentifier(session?.user.name);
    }, [session]);

    let {sendTransaction} = useSendTransaction({
      to: addressToSendTo,
      value: parseEther("0.05", "wei")
    });

    async function checkAndTopUpODISQuota() {
      const { remainingQuota } = await OdisUtils.Quota.getPnpQuotaStatus(
        sc!.issuerAddress,
        sc!.authSigner,
        sc!.serviceContext
      );
  
      console.log("remaining ODIS quota", remainingQuota);
      if (remainingQuota < 1) {
        // give odis payment contract permission to use cUSD
        const currentAllowance = await sc!.stableTokenContract.allowance(
          sc!.issuerAddress,
          sc!.odisPaymentsContract.address
        );
        console.log("current allowance:", currentAllowance.toString());
        let enoughAllowance: boolean = false;
  
        if (sc!.quotaFee.gt(currentAllowance)) {
          const approvalTxReceipt = await sc!.stableTokenContract
            .increaseAllowance(
              sc!.odisPaymentsContract.address,
              sc!.quotaFee
            )
            .sendAndWaitForReceipt();
          console.log("approval status", approvalTxReceipt.status);
          enoughAllowance = approvalTxReceipt.status;
        } else {
          enoughAllowance = true;
        }
  
        // increase quota
        if (enoughAllowance) {
          const odisPayment = await sc!.odisPaymentsContract
            .payInCUSD(sc!.issuerAddress, sc!.quotaFee)
            .sendAndWaitForReceipt();
          console.log("odis payment tx status:", odisPayment.status);
          console.log("odis payment tx hash:", odisPayment.transactionHash);
        } else {
          throw "cUSD approval failed";
        }
      }
    }

    async function getObfuscatedIdentifier(identifier: string){
      let obfuscatedIdentifier = (
        await OdisUtils.Identifier.getObfuscatedIdentifier(
          identifier,
          OdisUtils.Identifier.IdentifierPrefix.TWITTER,
          sc!.issuerAddress,
          sc!.authSigner,
          sc!.serviceContext,
          undefined,
          undefined,
          sc!.blindingClient
        )
      ).obfuscatedIdentifier;
      return obfuscatedIdentifier;
    }

    async function registerAttestation(identifier: string, account: string) {
      await checkAndTopUpODISQuota();

      let nowTimeStamp = Math.floor(new Date().getTime() / 1000);
  
      // get identifier from phone number using ODIS
      let obfuscatedIdentifier = getObfuscatedIdentifier(identifier);
  
      // upload identifier <-> address mapping to onchain registry
      await sc!.federatedAttestationsContract.registerAttestationAsIssuer(
        obfuscatedIdentifier,
        account,
        nowTimeStamp
      );
      alert("Address mapped.");
    }

    async function lookupAddresses() {
      
      const obfuscatedIdentifier = getObfuscatedIdentifier(socialIdentifier);
  
      // query onchain mappings
      let attestations =
        await sc!.federatedAttestationsContract.lookupAttestations(obfuscatedIdentifier, [
          sc!.issuerAddress,
        ]);
        let [latestAddress] = attestations.accounts;
        setAddressToSendTo(latestAddress);
      return attestations.accounts;
    }

    async function deregisterIdentifier(identifier: string){
      try{
        let obfuscatedIdentifier = getObfuscatedIdentifier(identifier);
        await sc!.federatedAttestationsContract.revokeAttestation(obfuscatedIdentifier, sc!.issuerAddress, address);
      }catch(err){

      }
    }

    
    
  
    let steps = [
      {
        id: 1,
        content: "User connection",
        active: !!address
      },
      {
        id: 2,
        content: "Verify identifier ownership",
        active: !!session
      },
      {
        id: 3,
        content: "Map identifier with connection address",
        active: !!address && !!session
      },
      {
        id: 4,
        content: "Send value through identifier",
        active: !!address && !!addressToSendTo
      },
      {
        id: 5,
        content: "De-register identifier from address",
        active: !!address && !!session
      }
    ]

  const [showModal, setShowModal] = useState(false);
  const [soulname, setSoulname] = useState("");
  const [availability, setAvailability] = useState(true)
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [timeframe, setTimeFrame] = useState(1)


  useEffect(() => {
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();

    const masa = new Masa({
      signer: signer,
      environment: "dev",
      networkName: "alfajores",
      apiUrl: "https://beta.middleware.masa.finance/",
    });
        const checkIsAvailable = async () => {
      if (soulname) {
        setLoadingAvailability(true);
        setAvailability(await masa.contracts.soulName.isAvailable(soulname));
        setLoadingAvailability(false);
      }
    };
    void checkIsAvailable();
  }, [soulname, setLoadingAvailability,setAvailability]);

  const createSoulname = async () => {
    try {
     
     const provider = new ethers.providers.Web3Provider(window.ethereum);
    //  await provider.send('eth_requestAccounts', []);
     const signer = provider.getSigner();
     console.log(signer)
     const masa = new Masa({
       signer: signer,
       environment: "dev",
       networkName: "alfajores",
       apiUrl: "https://beta.middleware.masa.finance/",
     });
     
     const isLoggedIn = await masa.session.checkLogin();
 

     if (isLoggedIn && availability) {
       const checkId = await masa.identity.load(signer._address);
 
       if (checkId.identityId) {
         const createSoulNames = await masa.soulName.create(
           "CELO",
           soulname,
           timeframe,
           undefined,
           "style"
         );
         if (createSoulNames.success) {
           toast.success("Succesfully created your soulname on masa");
           
         }
       } else {
         console.log("No ID:: creating with ID");
         toast.loading('Masa Identity been Processed')
         const createWithId = await masa.identity.createWithSoulName(
           "CELO",
           soulname,
           timeframe,
           "style"
         );
         if (createWithId.success) {
           toast.success("Your Soulname has been created");
           
         }
       }
     } else {
       toast.error('Oops something went wrong..try again')
       
     }
    }
   catch (error) {
    console.log(error)
   
   }

  };

  if(!iMounted) return null;
  
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
          
          <button 
            onClick={()=>registerAttestation(
              socialIdentifier,
              address!
          )}
            className="flex items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-5 py-2 shadow-lg transition-all hover:border-gray-800"  >
            <p className="text-sm">Register Attestation</p>
          </button>
          
        </div>
        </div>

        
      </div>

     <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
     <Toaster />
      <div className="py-6 px-6 lg:px-8 text-left">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Register Soulname (.celo)</h3>
        <form className="space-y-6 " action="#">
          <div>
            <label htmlFor="soul name" className="block mb-2 text-sm font-medium text-gray-900">
              Soulname
            </label>
            <input
              type="text"
              required
              onChange={(e) => {
                setSoulname(e.target.value);
              }}
              placeholder="search for soulnames"
              name="soulname"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div>
            <label htmlFor="timeframe" className="block mb-2 text-sm font-medium text-gray-900">
              Timeframe
            </label>
            <input
              type="number"
              required
              onChange={(e) => {
                const num = Number(e.target.value);
                setTimeFrame(num);
              }}
              placeholder="Timeframe for soulnames"
              name="timeframe"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          {
            loadingAvailability && (
              <>
                <p>checking soulname availability</p>
              </>
            )
          }
          {availability ? (
              <p className="mt-2 text-green-700">
                Available
              </p>
            ) : (
              <p className="mt-2 text-red-600">
                SoulName Not Available
              </p>
            )}
          
        </form>
        <button onClick={createSoulname} className="w-full text-white bg-blue-700 hover:bg-black focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg">
            Create Soulname
        </button>
      </div>
     </Modal>
    </div>

  );
};

export default DevsCard;