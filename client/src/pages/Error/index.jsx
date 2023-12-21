import { useNavigate } from "react-router-dom";

const Error = () => {
	const navigate = useNavigate();

	return (
		<div className="w-screen h-screen flex flex-col justify-center items-center gap-y-10">
			<p className="text-4xl">An error has occurred</p>
			<button className="text-xl hover:scale-110 duration-150" onClick={() => navigate("/")}>
				return to home
			</button>
		</div>
	);
};

export default Error;
