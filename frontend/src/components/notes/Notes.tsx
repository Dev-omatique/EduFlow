"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  NotebookText,
  CalendarDays,
  User,
  MessageSquare,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { de } from "zod/locales";


const apiUrl = process.env.NEXT_PUBLIC_API_URL
const Data = apiUrl + "api/notes"

export default function Notes() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Notes</h1>
            <p>Voici vos notes récentes :</p>
            <ul className="mt-4 space-y-2">
                <li className="p-4 bg-white rounded-lg shadow">
                    <h2 className="text-lg font-semibold">Mathématiques</h2>
                    <p>Note : 15/20</p>
                </li>
            </ul>
        </div>
    )
}