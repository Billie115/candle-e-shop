import { Link } from "react-router";

export default function admin(){
    return(
        <div className="flex flex-col h-screen w-48">
            <div className="border-2 m-1 p-2 border-black">
                <h1 className="text-xl">Dashboard</h1>
            </div>
            <div className="border-2 border-black m-1 p-2 flex-1">
                <Link to="/admin/products">
                    <div className="border-2 border-black p-2 m-1">
                        <h1 className="text-xl">Products</h1>
                    </div>
                </Link>
            </div>
        </div>
    );  
}