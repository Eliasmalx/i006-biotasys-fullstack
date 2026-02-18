import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) { 
    return ( 
    <div className="flex h-screen"> 
    <Sidebar /> 
    <div className="flex flex-col flex-1"> 
        <Header /> 
        <main className="flex-1 p-4 overflow-auto"> 
            {children} 
        </main> 
        </div> 
    </div> ); 
}