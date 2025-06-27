import Banner from "@/components/Banner";
import "@ant-design/v5-patch-for-react-19";
import "../globals.css";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="header">
        {/* <div className="banner">Vị trí tàu trên Cảng</div> */}
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
