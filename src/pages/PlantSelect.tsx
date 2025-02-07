import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Header } from './../components/Header';
import { EnviromentButton } from '../components/EnviromentButton';
import { PlantCardPrimary } from './PlantCardPrimary';
import { Load } from '../components/Load';

import api from '../services/api';

import colors from '../../styles/colors';
import fonts from '../../styles/fonts';

interface EnvironmentProps {
  key: string;
  title: string;
}

interface PlantProps {
  id: number;
  name: string;
  about: string;
  water_tips: string;
  photo: string;
  environments: [string];
  frequency: {
    times: number;
    repeat_every: string;
  }
}

export function PlantSelect() {
  const [selectedEnviroment, setSelectedEnviroment] = useState("all");
  const [environments, setEnvironments] = useState<EnvironmentProps[]>([]);
  const [plants, setPlants] = useState<PlantProps[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([]);
  const [loading, setLoading] = useState(true);


  const [page,setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigation = useNavigation();

  function handleEnvironmentSelected(environment: string) {
    setSelectedEnviroment(environment);

    if (environment === 'all') {
      setFilteredPlants(plants);
    } else {
      const filtered = plants.filter(plant => 
        plant.environments.includes(environment)
      );
      setFilteredPlants(filtered);
    }
    
  }

  async function fetchPlants() {
    const { data }= await api
    .get(`plants?_sort=name&order=asc&_page=${page}&_limit=8`);
    if (!data)
      return setLoading(true);
    if (page > 1) {
      setPlants(oldValue => [...oldValue, ...data]);
      setFilteredPlants(oldValue => [...oldValue, ...data]);
    } else {
      setPlants(data);
      setFilteredPlants(data);
    }

    setLoading(false);
    setLoadingMore(false);
  }

  function handleFeatchMore(distance:number) {
    if (distance < 1)
      return;
    
    setLoadingMore(true);
    setPage(oldValue => oldValue + 1);
    
    fetchPlants();
  }

  function handlePlantSelect(plant: PlantProps) {
    navigation.navigate('PlantSave', { plant });
  }

  useEffect(() => {
    async function fetchEnvironment() {
      const {data}= await api.get<EnvironmentProps[]>('plants_environments?_sort=title&order=asc');
      
      setEnvironments([
        {
          key: 'all',
          title: 'Todos',
        },
        ...data
      ]);

    }

    
    fetchEnvironment();
  }, []);

  useEffect(() => {
    fetchPlants();
    
  }, []);

  if (loading) 
    return <Load />  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header/>  
        <Text style={styles.title}>
          Em qual ambiente
        </Text>
        <Text style={styles.subtitle}>
          você quer colocar sua planta?
        </Text>
      </View>

      <View>
        <FlatList
          data={environments}
          keyExtractor={(item) => String  (item.key)}
          renderItem={({ item }) => (
            <EnviromentButton 
              title={item.title}
              active={item.key === selectedEnviroment}
              onPress={() => handleEnvironmentSelected(item.key)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.environmentList}
          ListHeaderComponent={<View />}
          ListHeaderComponentStyle={{ marginRight: 32 }}
        />
      </View>
      
      <View style={styles.plantsList}>
        <FlatList
          keyExtractor={(item) => String(item.id)}
          data={filteredPlants}
          renderItem={({ item }) => (
            <PlantCardPrimary
              key={item.id}
              data={item}
              onPress={() => handlePlantSelect(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          onEndReachedThreshold={0.1}
          onEndReached={({distanceFromEnd}) => handleFeatchMore(distanceFromEnd)}
          ListFooterComponent={
            loadingMore ?
            <ActivityIndicator color={colors.green} />
            : <></>
      
          }
        />
        
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 32,
  },
  environmentList: {
    height: 40,
    justifyContent: 'center',
    paddingBottom: 5,
    marginLeft: 32,
    marginVertical: 32,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.heading,
    color: colors.heading,
    lineHeight: 20,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: fonts.text,
    color: colors.heading,
    lineHeight: 20,
  },
  plantsList: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
})