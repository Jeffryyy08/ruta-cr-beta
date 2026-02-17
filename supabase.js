import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://sljzxaenmwujgjingqst.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsanp4YWVubXd1amdqaW5ncXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDI0MjMsImV4cCI6MjA4NjkxODQyM30.WdvJ95O5SHA5P85oSZMlmqEWbsCbl8Li6u4ctqgs9ho'
const supabase = createClient(supabaseUrl, supabaseKey)

let trackingInterval = null
let currentBusId = null

async function createBus() {
  const { data, error } = await supabase
    .from('buses')
    .insert([{ route_id: (await getRouteId()), active: true }])
    .select()

  if (error) {
    console.error(error)
    return null
  }

  return data[0].id
}

async function getRouteId() {
  const { data } = await supabase
    .from('routes')
    .select('id')
    .eq('name', 'Ciudad Quesada - Pital')
    .single()

  return data.id
}

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

    console.log("Precisión:", position.coords.accuracy)
    console.log("Ubicación enviada:", latitude, longitude)
  })
}

document.getElementById('start').addEventListener('click', async () => {
  currentBusId = await createBus()

  trackingInterval = setInterval(sendLocation, 5000)

  console.log("Tracking iniciado")
})

document.getElementById('stop').addEventListener('click', () => {
  clearInterval(trackingInterval)
  console.log("Tracking detenido")
})
