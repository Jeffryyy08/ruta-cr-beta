import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://sljzxaenmwujgjingqst.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsanp4YWVubXd1amdqaW5ncXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDI0MjMsImV4cCI6MjA4NjkxODQyM30.WdvJ95O5SHA5P85oSZMlmqEWbsCbl8Li6u4ctqgs9ho'

export const supabase = createClient(supabaseUrl, supabaseKey)

let trackingInterval = null
let currentBusId = null

// 🔹 Obtener route_id por nombre
async function getRouteId(routeName) {
  const { data, error } = await supabase
    .from('routes')
    .select('id')
    .eq('name', routeName)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data.id
}

// 🔹 Crear bus nuevo
async function createBus(routeName) {

  const routeId = await getRouteId(routeName)
  if (!routeId) return null

  const { data, error } = await supabase
    .from('buses')
    .insert([{ route_id: routeId, active: true }])
    .select()
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data.id
}

// 🔹 Enviar ubicación
async function sendLocation() {

  navigator.geolocation.getCurrentPosition(async (position) => {

    const { latitude, longitude } = position.coords

    await supabase
      .from('locations')
      .insert([{
        bus_id: currentBusId,
        lat: latitude,
        lng: longitude
      }])

    console.log("Ubicación enviada:", latitude, longitude)
  })
}

// 🔹 Iniciar tracking
export async function startTracking(routeName) {

  currentBusId = await createBus(routeName)

  if (!currentBusId) {
    console.error("No se pudo crear bus")
    return
  }

  trackingInterval = setInterval(sendLocation, 5000)

  console.log("Tracking iniciado")
}

// 🔹 Detener tracking
export function stopTracking() {
  clearInterval(trackingInterval)
  console.log("Tracking detenido")
}
