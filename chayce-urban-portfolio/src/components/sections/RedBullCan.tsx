"use client";

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from 'next/image';

export default function RedBullCan() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="cursor-pointer transition-transform hover:scale-110 duration-300">
          <Image
            src="/redbull-can.png"
            alt="Red Bull Can"
            width={60}
            height={120}
            className="object-contain"
          />
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Preworkout</SheetTitle>
          <SheetDescription>
            <video
              className="w-full max-h-[60vh] mt-4"
              controls
              autoPlay
            >
              <source src="/shotgun-redbull.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}