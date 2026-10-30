import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <View style={styles.header}>
        <Text style={styles.title}>Aloja-Te Móvil</Text>
        <Text style={styles.badge}>Modo Offline-First (Bolivia)</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>
          Conectividad adaptativa: Edge AI con Llama 3.2 local, sincronización SQLite / IndexedDB y compresión gRPC para baja señal.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#059669',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badge: {
    fontSize: 12,
    color: '#d1fae5',
    marginTop: 4,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    color: '#4b5563',
    lineHeight: 22,
  },
});
