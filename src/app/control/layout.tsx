import Banner from "@/components/Banner";
import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Ship Control",
  description: "Ship Position Managment",
};
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="header">
        {/* <div className="banner">Quản lý vị trí tàu</div> */}
        <Banner/>
      </header>

      <main>
        <div
          style={{
            backgroundImage: 'url("/background/background.png")',
          }}
        >
          {children}
        </div>
      </main>
    </>
  );
}
