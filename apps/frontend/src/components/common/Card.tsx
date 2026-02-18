export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
    children, 
    className = "", 
    ...props }) => { 
        return ( 
        <div className={`rounded-lg border border-slate-700 bg-slate-900/40 p-4 ${className}`} {...props} >
             {children} 
        </div> ); 
        };