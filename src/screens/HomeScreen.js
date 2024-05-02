import {
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "react-native-heroicons/outline";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen"
import { StatusBar } from "expo-status-bar";
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export default function HomeScreen() {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency1, setSelectedCurrency1] = useState('');
  const [selectedCurrency2, setSelectedCurrency2] = useState('');
  const [resultConversion, setResultConversion] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);


  const apiKey = 'b980ddae0a2e71e64423a5f7';
  const baseUrl = 'https://v6.exchangerate-api.com/v6/';
  

  // Função para obter a lista de moedas da API
  const fetchCurrencies = async () => {
    try {
      // Verifica se as moedas já foram previamente armazenadas localmente
      const storedCurrencies = await AsyncStorage.getItem('currencies');
      if (storedCurrencies) {
        // Se sim, utiliza as moedas armazenadas localmente
        const currenciesData = JSON.parse(storedCurrencies);
        console.log("Já tenho isso salvo")
        setCurrencies(currenciesData);
      } else {
        // Se não, faz a requisição para obter as moedas da API
        const response = await axios.get(`${baseUrl}${apiKey}/codes`);
        const currenciesData = response.data.supported_codes.map(currency => currency[0]);
        // Armazena as moedas localmente para uso futuro
        await AsyncStorage.setItem('currencies', JSON.stringify(currenciesData));
        setCurrencies(currenciesData);
      }
    } catch (error) {
      console.error('Erro ao obter as moedas:', error);
    }
  };


  const getConversion = async () => {
    try {
      setLoading(true); // Ativa o loading
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1 segundo
      const response = await axios.get(`${baseUrl}${apiKey}/pair/${selectedCurrency1}/${selectedCurrency2}`);
      const conversionRate = response.data.conversion_rate;
      const convertedAmount = amount * conversionRate;
      setResultConversion(convertedAmount);
    } catch (error) {
      console.error('Erro na conversão:', error);
    } finally {
      setLoading(false); // Desativa o loading após a conversão
    }
  };


  useEffect(() => {
    fetchCurrencies();
  }, []);


  const handleCurrencyChange1 = (value) => {
    setSelectedCurrency1(value);
  };

  const handleCurrencyChange2 = (value) => {
    setSelectedCurrency2(value);
  };

  const handleAmountChange = (value) => {
    setAmount(value);
  };

  const pickerStyles = {
    inputIOS: styles.pickerInput,
    inputAndroid: styles.pickerInput,
    placeholder: { color: 'gray' },
  }
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView>
        <View className="space-y-1 mb-2 mx-auto mt-5">
              <Text
                style={{
                  fontSize: hp(3.5),
                }}
                className="font-bold text-neutral-800"
              >
                Conversor
              </Text>
        </View>
        <View className="flex-row w-full justify-center mb-5 mt-5">
           {/* primeiro seletor*/}
          <View className="flex-row items-center border rounded-xl border-black p-[6px]">
              <TextInput
                placeholder="Quantidade"
                placeholderTextColor={"gray"}
                value={amount}
                onChangeText={handleAmountChange}
                style={{
                  fontSize: hp(1.7),
                }}
                className="w-4/6 text-base mb-1 pl-1 tracking-widest"
              />
            </View>
            <View className=" flex-row items-center border rounded-xl border-black p-[6px] justify-between ml-5 w-1/6">
                <RNPickerSelect 
                  onValueChange={handleCurrencyChange1}
                  placeholder={{ label: "Moeda"}}
                  style={pickerStyles}
                  items={currencies.map((currency) => ({
                    label: currency,
                    value: currency,
                  }))}
                  />
                <View className="bg-white rounded-full p-2">
                  <MagnifyingGlassIcon
                    size={hp(2.5)}
                    color={"gray"}
                    strokeWidth={3}
                  />
                </View>
            </View>
        </View>
        <View className="w-full justify-center flex-row mb-10 mt-10">
              <Text
                style={{
                  fontSize: hp(2.5),
                }}
                className="font-normal text-neutral-800"
              >
                Trânsforma para
              </Text>
        </View>
        <View className="flex-row w-full justify-around align-middle mb-5 mt-5">
             {/* Segundo seletor*/}
            <View className=" flex-row items-center border rounded-xl border-black p-[6px] justify-between  w-5/6 mx-2.5">
                <RNPickerSelect
                  style={pickerStyles}
                  onValueChange={handleCurrencyChange2}
                  placeholder={{ label: "Selecione uma moeda"}}
                  items={currencies.map((currency) => ({
                    label: currency,
                    value: currency,
                  }))}
                />
                <View className="bg-white rounded-full p-2 ">
                  <MagnifyingGlassIcon
                    size={hp(2.5)}
                    color={"gray"}
                    strokeWidth={3}
                  />
                </View>
            </View>
        </View>
        <View className="flex-row w-full justify-around align-middle mb-5 mt-5">
           {/* Botão de conversão*/}
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: "#ef7911",
                paddingVertical: hp(1.5),
                paddingHorizontal: hp(5),
                borderRadius: hp(1.5),
              }}
              onPress={getConversion}
            >
              <Text
                style={{
                  color: "#ffff",
                  fontSize: hp(2.2),
                  fontWeight: "medium",
                }}
              >
                Converter
              </Text>
            </TouchableOpacity>
          </View>
          
        </View>
         {/*Texto com resultado*/}
        <View className="flex m-auto">
            {resultConversion !== '' && (
              <View style={{ 
                marginTop: 20,
                 
                }}>
                <Text style={{ 
                fontSize: hp(2.2)
                 
                }}>O valor convertido é: ${Math.round((resultConversion),2)} {selectedCurrency2}</Text>
              </View>
            )}
        </View>
        {/* 
         */}
      </SafeAreaView>
       {/* Loading para calculo */}
      {loading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../../assets/loading.gif')} style={{ width: 100, height: 100 }} />
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
  },
  pickerInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    width:'auto'
  },
  colorPreview: {
    marginTop: 10,
    width: 50,
    height: 50,
    alignSelf: 'center',
  },
});