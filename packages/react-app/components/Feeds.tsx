"use client";

import prisma from "@/libs/prisma";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

import DevsCard from "./DevsCard";

const DevCardList = () => {
  return (
    <div className=' prompt_layout'>
      {
          <DevsCard  /> 
      }
      
    </div>
  );
};

const Feed = () => {
  const [devs, setAllDevs] = useState([]);
  const {data: session} = useSession()
  

  //Fetch all developers from the database
  // const fetchDevs = async () => {
  //   const response = await prisma.user.findUnique({
      
  //   })
    

  //   setAllDevs(response);
  // };

  // useEffect(() => {
  //   fetchDevs();
  // }, []);

  


  return (
    <section className='feed'>
      
      <form className='relative w-full flex-center'>
        <input
          type='text'
          placeholder='Search for developers using github usernames or Masa Soulnames'
          className='search_input peer'
        />
      </form>
      <div className='orange_gradient text-center'><h1>Developers on Dev Connect</h1></div>
      <DevCardList />
     
    </section>
  );
};



export default Feed;