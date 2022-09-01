import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Device from "./Device";

function Panel() {
	const [devices, setDevices] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetch("http://localhost:3100")
			.then((res) => res.json())
		
			.then((data) => {
				setDevices(
					Object.keys(data).map((dI) => <Device deviseInfo={dI} key={dI} />)
				);
				setIsLoading(false);
			})
			.catch(console.error);
	}, []);
	if (isLoading)
		return (
			<Container style={{ justifyContent: "center" }}>
				<p>Loading...</p>
			</Container>
		);
	return (
		<Container>
			<h1>BETAPHARMA</h1>
			<DeviceContainer>{devices}</DeviceContainer>
		</Container>
	);
}

export default Panel;

const DeviceContainer = styled.div`
	display: flex;
	justify-content: space-around;
	align-items: flex-start;
	width: 100%;
	flex-grow: 1;
	flex-wrap: wrap;
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100vh;
	width: 100vw;
`;
