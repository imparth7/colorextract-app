import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native'

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

  // Function to call API
  const callApi = async (fileData: FileInfo) => {
    try {
      setLoading(true);
      setColors([]);

      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: fileData.uri,
        name: fileData.name,
        type: fileData.mimeType || 'application/octet-stream',
      } as any);

      // Call the API
      const response = await fetch('http://127.0.0.1:5000/extract-colors', {  // Ensure your API endpoint is correct
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
      console.log('API Response:', result);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>File Upload & Color Boxes</Text>

        {/* File Picker Button */}
        <Button title="Pick a File" onPress={pickFile} />

        {/* Display Image Preview */}
        {file && (
          <>
            <Image source={{ uri: file.uri }} style={styles.imagePreview} />
          </>
        )}

        {/* Loading Indicator */}
        {loading && <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 10 }} />}

        {/* Display Colors */}
        <ScrollView contentContainerStyle={styles.colorContainer}>
          {colors.map((color, index) => (
            <View key={index} style={[styles.colorBox, { backgroundColor: color.Hex }]}>
              <Text style={styles.colorText}>{color.Hex}</Text>
              <Text style={styles.colorText}>{color.RGB}</Text>
              <Text style={styles.colorText}>{color.HSL}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
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
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorBox: {
    width: 200,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  colorText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
