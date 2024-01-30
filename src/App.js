// import React, { useState, useEffect } from "react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useRef } from "react";

export default function App() {
  const [inputIp, setInputIp] = useState("");
  const [finalIP, setFinalIP] = useState("");
  const [details, setDetails] = useState({
    ip: " ",
    isp: " ",
    location: { name: "", region: " " },
  });
  const [coords, setCords] = useState([]);

  useEffect(() => {
    async function fetchDetails(ip) {
      const res = await fetch(
        `https://geo.ipify.org/api/v2/country?apiKey=at_n5WJa0lDkhzsaAHBq4s4tdIzsoa6V&ipAddress=${ip}`
      );
      const data = await res.json();
      setDetails(data);

      const res1 = await fetch(
        `https://api.geoapify.com/v1/ipinfo?ip=${ip}&apiKey=145fb03052f543e98e324ad1ba744f79`
      );
      const data1 = await res1.json();

      const { latitude, longitude } = data1.location;
      setCords([Number(latitude), Number(longitude)]);
    }

    if (finalIP) {
      fetchDetails(finalIP);
    } else {
      // If inputIp is empty, fetch details for the user's IP
      async function fetchUserDetails() {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        const userIp = data.ip;
        fetchDetails(userIp);
      }
      fetchUserDetails();
    }
  }, [finalIP]);

  function isValidIpAddress(ip) {
    const ipAddressRegex =
      /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
    return ipAddressRegex.test(ip);
  }

  function updateDetails(newIp) {
    setInputIp("");
    if (isValidIpAddress(newIp)) {
      setFinalIP(newIp);
    } else {
      alert("Invalid IP address format");
      // Optionally, you can handle the case where the IP is not in the correct format.
      // You can show an error message or take any other appropriate action.
    }
  }

  return (
    <>
      <div className="wrapper">
        <img
          className="background"
          src="/images/pattern-bg-desktop.png"
          alt="patter"
        />
        {coords && <MapComponent coords={coords} />}
      </div>
      <Container
        details={details}
        inputIp={inputIp}
        setInputIp={setInputIp}
        updateDetails={updateDetails}
      />
    </>
  );
}

function MapComponent({ coords }) {
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef.current && coords && coords.length === 2) {
      mapRef.current.setView(coords, mapRef.current.getZoom());
    }
  }, [coords]);

  if (!coords || coords.length !== 2) {
    return null;
  }

  const defaultMarkerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <MapContainer
      center={coords}
      zoom={13}
      className="map-container"
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={coords} icon={defaultMarkerIcon}>
        <Popup
          autoClose={false}
          eventHandlers={{
            open: () => {
              setTimeout(() => {
                mapRef.current &&
                  mapRef.current.leafletElement.invalidateSize();
              }, 0);
            },
          }}
        >
          <div>
            <h3>Your Location</h3>
            <p>Latitude: {coords[0]}</p>
            <p>Longitude: {coords[1]}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

function Header() {
  return <h1 className="header">IP Adrress Tracker</h1>;
}

function Input({ inputIp, setInputIp, updateDetails }) {
  function handleSubmit(e) {
    e.preventDefault();
    updateDetails(inputIp);
  }
  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        value={inputIp}
        onChange={(e) => setInputIp(e.target.value)}
        type="text"
        placeholder="Seach for any IP adress or domain"
      />
      <button>
        <img src="/images/icon-arrow.svg" alt="Arrow Icon" />
      </button>
    </form>
  );
}

function Container({ details, inputIp, setInputIp, updateDetails }) {
  return (
    <div className="container">
      <Header />
      <Input
        inputIp={inputIp}
        setInputIp={setInputIp}
        updateDetails={updateDetails}
      />
      <Details details={details} />
    </div>
  );
}

function Details({ details }) {
  console.log(details);

  return (
    <div className="details-container">
      <div className="small">
        <span>IP ADDRESS</span>
        <p>{details.ip}</p>
      </div>
      <div className="small">
        <span>LOCATION</span>
        <p>{details.location.region}</p>
      </div>
      <div className="small">
        <span>TIMEZONE</span>
        <p>{details.location.timezone}</p>
      </div>
      <div className="small">
        <span>ISP</span>
        <p>{details.isp}</p>
      </div>
    </div>
  );
}
// "https://api.ipify.org?format=json
// https://geo.ipify.org/api/v2/country?apiKey=at_n5WJa0lDkhzsaAHBq4s4tdIzsoa6V&ipAddress=${ip}
