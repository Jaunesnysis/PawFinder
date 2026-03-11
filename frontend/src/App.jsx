import { useState, useEffect } from 'react'
import io from 'socket.io-client' // Importuojame WebSocket klientą
import './App.css'

// Prisijungiame prie tavo Backend serverio (portas 5050)
const socket = io('http://localhost:5050')

function App() {
    // Būsena (state) pranešimui saugoti
    const [statusMessage, setStatusMessage] = useState('Laukiama realaus laiko atnaujinimų...')

    useEffect(() => {
        // 1. Klausomės "StatusChanged" įvykio iš Backend
        socket.on('StatusChanged', (data) => {
            console.log('Gautas WebSocket signalas:', data)
            // Atnaujiname tekstą ekrane, kai gauname signalą
            setStatusMessage(`SVARBU: ${data.message} (${new Date().toLocaleTimeString()})`)
        })

        // 2. Svarbu: "išvalyti" ryšį, kai vartotojas išeina iš puslapio
        return () => {
            socket.off('StatusChanged')
        }
    }, [])

    return (
        <div className="App">
            <h1>PawFinder Savanorio Langas</h1>

            <div className="card" style={{ border: '2px solid #646cff', padding: '20px' }}>
                <h3>Realaus laiko būsena:</h3>
                {/* Šitas tekstas pasikeis pats, kai serveris išsiųs pranešimą */}
                <p style={{ fontWeight: 'bold', color: '#646cff' }}>
                    {statusMessage}
                </p>
            </div>

            <p className="read-the-docs">
                AC1.2 testas: Jei tekstas viršuje pasikeičia be puslapio perkrovimo – WebSockets veikia.
            </p>
        </div>
    )
}

export default App