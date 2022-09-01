import React from "react";
import styled from "styled-components";

function Device({ deviceInfo }) {
	return (
		<DeviceContainer>
			<h3>{deviceInfo}</h3>
			<button
			
				onClick={() => {
					fetch(`http://localhost:3100/reporte/${deviceInfo}`, {
						method: "GET",
					}).catch(console.error);
				}}
			>
				imprimir
			</button>
		</DeviceContainer>
	);
}

export default Device;

const DeviceContainer = styled.div`
	width: 30vw;
	height: 20%;
	border: 1px solid black;
	display: flex;
	flex-direction: column;

	justify-content: center;
	align-items: center;
`;
