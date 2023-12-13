import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity, StyleSheet, Text, View, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const zonasEstacionamiento = ['Zona A', 'Zona B', 'Zona C'];
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [proximityValue, setProximityValue] = useState(0); // Estado inicial
  const [parkingStatus, setParkingStatus] = useState('Disponible');

  const handleEstacionamientoSelect = (zona) => {
    setSelectedZone(zona);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedZone(null);
  };

  const fetchData = () => {
    const params = new URLSearchParams();
    params.append('led_status', '1');
    params.append('distance_data', '0');

    fetch('https://estacionaithua.000webhostapp.com/index.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setProximityValue(data.proximity_value);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

  const parkSpaceColor = proximityValue === '0' ? 'green' : 'red';
  const parkSpaceText = proximityValue === '0' ? 'Disponible' : 'Ocupado';
  const parkSpaceColo = parkingStatus === '0' ? 'green' : 'red';
  const toggleParking = async (parkingZone) => {
    try {
      const serverURL = 'https://estacionaithua.000webhostapp.com/index.php';

      const command = parkingStatus === 'Disponible' ? 'reserve' : 'no reserve';
      console.log('Solicitud POST:', `control_command=${command}`);

      const response = await fetch(serverURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `control_command=${command}&zone=${parkingZone}`,
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        if (command === 'reserve') {
          console.log(`El estacionamiento en la zona ${parkingZone} ha sido reservado.`);
          setParkingStatus('Apartado'); // Cambia el estado local a 'Apartado'
          const parkSpaceColor = parkingStatus === '0' ? 'green' : 'red';
        } else {
          console.log(`El estacionamiento en la zona ${parkingZone} ha sido liberado.`);
          setParkingStatus('Disponible'); // Cambia el estado local a 'Disponible'
        }
      } else {
        console.error('Error en la solicitud HTTP para cambiar la reserva del estacionamiento.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <LinearGradient colors={['#1A78BD', '#1279BF']} style={styles.linearGradient}>
      <View style={styles.container}>
        <SafeAreaView style={styles.headerSAV}>
          <Image style={{ width: 150, height: 150 }} source={require('./assets/logo.png')} />
        </SafeAreaView>
        <SafeAreaView style={styles.bodySAV}>
          <Text>Selecciona tu lugar de Estacionamiento:</Text>
          {zonasEstacionamiento.map((zona, index) => (
            <TouchableOpacity
              key={index}
              style={styles.estacionamiento}
              onPress={() => handleEstacionamientoSelect(zona)}
            >
              <Text>{zona}</Text>
            </TouchableOpacity>
          ))}
        </SafeAreaView>

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Mapa de Estacionamiento - Zona {selectedZone}</Text>
            <View style={styles.map}>
              <View style={styles.parking_space}>
                <Image
                  style={styles.autoImage}
                  source={require('./assets/car_marker.png')}
                />
                <View style={styles.bottomTextContainer}>
                  <Text style={[styles.bottomText, { color: 'green' }]}>
                    Disponible
                  </Text>
                </View>
              </View>
              <View style={styles.parking_space}>
                <Image
                  style={styles.autoImage}
                  source={require('./assets/car_marker.png')}
                />
                <View style={styles.bottomTextContainer}>
                  <Text style={[styles.bottomText, { color: parkSpaceColor }]}>
                    {parkingStatus === 'Disponible' ? parkSpaceText : 'Apartado'}
                  </Text>
                </View>
              </View>
              <View style={styles.parking_space}>
                <Image
                  style={styles.autoImage}
                  source={require('./assets/car_marker.png')}
                />
                <View style={styles.bottomTextContainer}>
                  <Text style={[styles.bottomText, { color: 'green' }]}>
                    Disponible
                  </Text>
                </View>
              </View>
              <View style={styles.parking_space}>
                <Image
                  style={styles.autoImage}
                  source={require('./assets/car_marker.png')}
                />
                <View style={styles.bottomTextContainer}>
                  <Text style={[styles.bottomText, { color: 'green' }]}>
                    Disponible
                  </Text>
                </View>
              </View>
              {/* Agregar más vistas de parking_space si es necesario */}
            </View>
            <TouchableOpacity
              onPress={() => toggleParking(selectedZone, parkSpaceText ? parkSpaceColo: parkSpaceColor)}
              style={[
                styles.apartarButton,
                parkSpaceText === 'Disponible' ? styles.availableButton : styles.occupiedButton,
              ]}
            >
              <Text style={styles.apartarButtonText}>
                {parkSpaceText === 'Disponible' ? 'Apartar' : 'Liberar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cerrar Mapa</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>

    </LinearGradient>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
  },
  headerSAV: {
    marginTop: 150,
  },
  headerText: {
    marginBottom: 10,
    fontSize: 30,
    justifyContent: 'center',
  },
  bodySAV: {
    marginTop: 100,
    alignItems: 'center',
  },
  estacionamiento: {
    width: 300,
    height: 50,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1279BF',
    padding: 20,
  },
  modalHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '50%',
    backgroundColor: '#F2ECF5',
    borderRadius: 10,
    flexDirection: 'row',
    alignContent: 'center',
  },
  parking_space: {
    width: '20%',
    height: '30%',
    flexDirection: 'row',
    backgroundColor: 'black',
    marginLeft: 15,
    marginTop: 10,
    borderRadius: 5,
  },
  autoImage: {
    width: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
  bottomTextContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  bottomText: {
    color: 'white',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  apartarButton: {
    marginTop: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'center',
  },
  apartarButtonText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});