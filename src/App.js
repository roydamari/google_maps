import React, { useEffect, useState } from 'react';
import './App.css';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import Modal from 'react-modal';
import mapStyles from './mapStyle';
import places from './places';

const libraries = ['places']
const mapContainerStyle = {
  width: '100vw',
  height: '100vh'
};
const center = {
  lat: 31,
  lng: 35
};
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true
}
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    height: '50%',
    width: '50%'
  }
};

function App() {
  const [marker, setMarker] = useState();
  const [random, setRandom] = useState();
  const [counter, setCounter] = useState(0);
  const [score, setScore] = useState(0);
  const [modalIsOpen, setIsOpen] = useState(true);
  const [usedCities, setUsedCities] = useState([]);


  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
    let newRandom = places[Math.floor(Math.random() * places.length)];
    setRandom(newRandom);
    alert('Find ' + newRandom.Name);
  }

  useEffect(() => {
    if (counter >= 500) {
      if (score > 10) {
        alert(`Game over, Your score is ${score}, good job!`)
      } else {
        alert(`Game over, Your score is ${score}, you can do better!`)
      }
      setScore(0);
      setCounter(0);
      openModal();
    }
  }, [score])


  useEffect(() => {
    if (marker) {
      (async function fetchData() {
        fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${marker.lat},${marker.lng}&destination=${random.Y},${random.X}&region=es&key=AIzaSyA4eulE6ZNjOyvwIvmVmbA334lmuTWVaP4`)
          .then(response => response.json())
          .then(data => {
            if (data.routes[0]) {
              console.log(data.routes[0].legs[0].distance.text)
              setCounter(prev => prev += Math.round(data.routes[0].legs[0].distance.value / 1000))
              setScore(prev => prev += 1);
              let newRandom;
              do {
                newRandom = places[Math.floor(Math.random() * places.length)];
              } while (usedCities.includes(newRandom))
              setUsedCities(prev => prev.concat([newRandom]))
              setRandom(newRandom);
              alert('Find ' + newRandom.Name);
            } else {
              let newRandom = places[Math.floor(Math.random() * places.length)];
              setRandom(newRandom);
            }
          });
      })();
    }
  }, [marker])

  function hint() {
    alert("it's somewhere in the " + random.Region + " Region")
  }


  function updateMarker(e) {
    setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA4eulE6ZNjOyvwIvmVmbA334lmuTWVaP4',
    libraries
  })

  if (loadError) return "Error loading map";
  if (!isLoaded) return "LoadingMaps";


  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div>
          <h1>City Game</h1>
          <p>You will be given a random Israeli city, your task is to pin point the location of the city, make sure to place it as close as possible cause once you cross 500km it's game over!
          Your score will be counted by how many cities you were able to pin point before crossing the 500km mark, Good Luck! <br />
          Tip: If you're having trouble finding the city or settlement you can get a hint to have a general idea where it is.
          </p>
          <button onClick={closeModal}>Start</button>
        </div>
      </Modal>
      <div style={{ zIndex: '2' }}>Distance: {counter}km Score: {score} <button onClick={hint}>Hint</button></div>
      <div>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={8}
          center={center}
          options={options}
          onClick={updateMarker}
        >
          <Marker position={marker} />
        </GoogleMap>
      </div>
    </>
  );
}

export default App;
