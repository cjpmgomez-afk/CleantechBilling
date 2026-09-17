"use client";
import { useRouter } from "next/navigation";
export default function LogoutButton() {
  const router = useRouter();
  const out = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };
  return <button className="badge" onClick={out}>Log out</button>;
}