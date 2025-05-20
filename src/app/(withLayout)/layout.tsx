import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

export const metadata: Metadata = {
  title: "Ship Image Managment",
  description: "Ship Image Managment",
};
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="header">Vị trí tàu trên Cảng</header>
      <main>
        <div
          style={{
            backgroundImage: 'url("/background/background.png")',
            // backgroundSize: "cover",
            // backgroundPosition: "center",
            // backgroundRepeat: "no-repeat",
          }}
        >
          {children}
        </div>
      </main>
    </>
  );
}
