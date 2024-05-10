"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const { status } = useSession();
  return (
    <header className="bg-white shadow myNav">
      <nav className="mx-auto flex max-w-7xl items-center justify-between lg:px-8 box-border">
        <Link href="/" className="-m-1 p-1">
          <img src="/logo.png" className="h-[150px]" alt="" />
        </Link>

        {status !== "authenticated" ? (
          <Link
            href="/login"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Log in
          </Link>
        ) : (
          <div className="flex gap-4">
            <Link
              href="/organizations"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Organizations
            </Link>
            <div
              onClick={(event) => {
                event.preventDefault();
                signOut();
              }}
              className="font-semibold text-sm cursor-pointer"
            >
              Logout
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
