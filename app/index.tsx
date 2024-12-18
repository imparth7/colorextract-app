import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, Image, StatusBar, Platform, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native'
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import checkColor from '@/utils/checkColor';
import * as Clipboard from 'expo-clipboard';

type FileInfo = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

type ColorInfo = {
  Hex: string;
  RGB: string;
  HSL: string;
};

export default function HomeScreen() {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [colors, setColors] = useState<ColorInfo[]>([]);

  // Function to pick a file
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Accept all file types
      });

      if (result.canceled) {
        console.log('File picking cancelled');
        return;
      }

      const selectedFile = result.assets[0];
      setFile({
        uri: selectedFile.uri,
        name: selectedFile.name,
        mimeType: selectedFile.mimeType,
        size: selectedFile.size,
      });

      console.log('File selected:', selectedFile);

      // Call API after file upload
      callApi(selectedFile);
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  // Function to Clear File Selection
  const clearFile = () => {
    setFile(null)
    setColors([])
  }

  // Function to copy color text
  const copyColor = async (txt: string) => {
    await Clipboard.setStringAsync(txt);
  }

  // Function to call API
  const callApi = async (fileData: FileInfo) => {
    try {
      setLoading(true);
      setColors([]);

      // Create form data
      const formData = new FormData();
      formData.append("n_colors", "10");
      formData.append('image', {
        uri: fileData.uri,
        name: fileData.name,
        type: fileData.mimeType || 'application/octet-stream',
      } as any);

      // Call the API
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/extract-colors`, {  // Ensure your API endpoint is correct
        method: 'POST',
        body: formData,
      });

      // Check if the response status is OK (200)
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Parse JSON response
      const result = await response.json();
      // console.log('API Response:', result);

      if (result.colors) {
        setColors(result.colors);
      } else {
        console.error('No colors found in response');
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={[styles.safeview, { marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Color Extractor</ThemedText>

        {/* File Picker Button */}
        <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Button title="Pick a File" onPress={pickFile} />
          <Button title="Clear Selection" onPress={clearFile} disabled={!loading && colors && !file || loading} />
        </View>

        {/* Display Image Preview */}
        {file && (
          <>
            <Image source={{ uri: file.uri }} style={styles.imagePreview} />
          </>
        )}

        {/* Loading Indicator */}
        {loading && <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 10 }} />}

        {/* Display Colors */}
        <ScrollView overScrollMode='never' showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
          <View style={styles.colorContainer}>
            {colors.map((color, index) => {
              let textColor = checkColor(color.HSL);
              return (
                <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => copyColor(color.Hex)}>
                  <View style={[styles.colorBox, { backgroundColor: color.Hex }]}>
                    <Text style={[styles.colorText, { color: textColor }]}>{color.Hex}</Text>
                    <Text style={[styles.colorText, { color: textColor }]}>{color.RGB}</Text>
                    <Text style={[styles.colorText, { color: textColor }]}>{color.HSL}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fileInfo: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  colorContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorBox: {
    width: 150,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  colorText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
