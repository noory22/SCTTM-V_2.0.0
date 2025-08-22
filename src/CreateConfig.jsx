import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// SVG Icon Components
const ArrowLeft = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const Power = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>
  </svg>
);

const AlertCircle = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4M12 16h.01"/>
  </svg>
);

const Download = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

const CreateConfig = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    configName: '',
    distance: '',
    temperature: '',
    peakForce: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSerialError, setShowSerialError] = useState(true);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate Configuration Name (alphabets only)
    if (!formData.configName.trim()) {
      newErrors.configName = 'Configuration name is required';
    } else if (!/^[A-Za-z]+$/.test(formData.configName)) {
      newErrors.configName = 'Configuration name must contain only alphabets';
    }
    
    // Validate Distance (numeric)
    if (!formData.distance.trim()) {
      newErrors.distance = 'Distance is required';
    } else if (isNaN(formData.distance) || parseFloat(formData.distance) <= 0) {
      newErrors.distance = 'Please enter a valid positive number';
    }
    
    // Validate Temperature (numeric)
    if (!formData.temperature.trim()) {
      newErrors.temperature = 'Temperature is required';
    } else if (isNaN(formData.temperature) || parseFloat(formData.temperature) <= 0) {
      newErrors.temperature = 'Please enter a valid positive number';
    }
    
    // Validate Peak Force (numeric)
    if (!formData.peakForce.trim()) {
      newErrors.peakForce = 'Peak force is required';
    } else if (isNaN(formData.peakForce) || parseFloat(formData.peakForce) <= 0) {
      newErrors.peakForce = 'Please enter a valid positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation based on field type
    if (name === 'configName' && !/^[a-zA-Z]*$/.test(value)) {
      return; // Only allow alphabets for config name
    }
    
    if ((name === 'distance' || name === 'temperature' || name === 'peakForce') && 
        !/^\d*\.?\d*$/.test(value)) {
      return; // Only allow numbers for numeric fields
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check for duplicate configuration names
      const existingConfigs = await window.electronAPI.readConfigFile();
      if (existingConfigs.some(config => config.configName === formData.configName)) {
        setErrors({ configName: 'Configuration Name already exists' });
        setIsLoading(false);
        return;
      }
      
      // Add new config and save
      const updatedConfigs = [...existingConfigs, formData];
      await window.electronAPI.writeConfigFile(updatedConfigs);
      
      setSuccessMessage('Configuration has been saved successfully');
      setErrors({});
      
      // Reset form
      setFormData({
        configName: '',
        distance: '',
        temperature: '',
        peakForce: ''
      });
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      setErrors({ submit: 'Error saving configuration. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/main-menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Create Configuration</h1>
          </div>
          
          <button className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
            <Power className="w-6 h-6" />
          </button>
        </div>

        {/* Serial Port Error */}
        {showSerialError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-semibold">ERROR: REQUIRED SERIAL PORT NOT FOUND</p>
                  <p className="text-red-600 text-sm mt-1">Please ensure the device is connected and try again.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSerialError(false)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-800 font-semibold">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 font-semibold">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Configuration Name */}
              <div className="space-y-2">
                <label htmlFor="configName" className="block text-sm font-semibold text-slate-700">
                  Configuration Name (Alphabets only)
                </label>
                <input
                  type="text"
                  id="configName"
                  name="configName"
                  value={formData.configName}
                  onChange={handleInputChange}
                  placeholder="Enter configuration name"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                    errors.configName 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.configName && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.configName}</span>
                  </p>
                )}
              </div>

              {/* Distance and Temperature Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distance */}
                <div className="space-y-2">
                  <label htmlFor="distance" className="block text-sm font-semibold text-slate-700">
                    Distance (mm)
                  </label>
                  <input
                    type="number"
                    id="distance"
                    name="distance"
                    value={formData.distance}
                    onChange={handleInputChange}
                    placeholder="Enter distance"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                      errors.distance 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.distance && (
                    <p className="text-red-500 text-sm flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.distance}</span>
                    </p>
                  )}
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <label htmlFor="temperature" className="block text-sm font-semibold text-slate-700">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    id="temperature"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder="Enter temperature"
                    step="0.1"
                    min="0"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                      errors.temperature 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.temperature && (
                    <p className="text-red-500 text-sm flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.temperature}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Peak Force */}
              <div className="space-y-2">
                <label htmlFor="peakForce" className="block text-sm font-semibold text-slate-700">
                  Peak Force (N)
                </label>
                <input
                  type="number"
                  id="peakForce"
                  name="peakForce"
                  value={formData.peakForce}
                  onChange={handleInputChange}
                  placeholder="Enter peak force"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                    errors.peakForce 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.peakForce && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.peakForce}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6 flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-2 min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Create</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-3 border-2 border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Configuration Guidelines</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Configuration Name must contain only alphabets (no numbers or special characters)</li>
                <li>• All values are required and must be positive numbers</li>
                <li>• Configuration will be saved to ConfigFile.csv</li>
                <li>• Ensure serial port connection before creating configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateConfig;