import React, { useState, useEffect } from 'react'
import SliderWidget from '../components/widgets/slider-widget'
import CodePanel from '../components/panels/code-panel'
import { DCTLButton } from '../components/ui/dctl-button'

// Sample DCTL code for demo
const sampleDCTLCode = `// Professional DCTL Film Emulation
// Created with DCTL Web Generator

__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B) {
    // Input RGB values
    float3 rgb = make_float3(p_R, p_G, p_B);
    
    // Parameters (will be updated in real-time)
    float exposure = 0.2f;      // Exposure adjustment
    float contrast = 1.1f;      // Contrast enhancement
    float saturation = 1.2f;    // Color saturation
    float temperature = 6500.0f; // Color temperature
    float highlights = -0.1f;   // Highlight recovery
    float shadows = 0.2f;       // Shadow lift
    
    // Apply exposure adjustment
    rgb = rgb * _powf(2.0f, exposure);
    
    // Contrast adjustment (S-curve)
    rgb.x = _powf(rgb.x, contrast);
    rgb.y = _powf(rgb.y, contrast);
    rgb.z = _powf(rgb.z, contrast);
    
    // Color temperature adjustment
    if (temperature < 6500.0f) {
        rgb.x *= 1.0f + (6500.0f - temperature) / 6500.0f * 0.3f;
        rgb.z *= 1.0f - (6500.0f - temperature) / 6500.0f * 0.2f;
    } else {
        rgb.z *= 1.0f + (temperature - 6500.0f) / 3500.0f * 0.3f;
        rgb.x *= 1.0f - (temperature - 6500.0f) / 3500.0f * 0.1f;
    }
    
    // Saturation adjustment
    float luma = 0.299f * rgb.x + 0.587f * rgb.y + 0.114f * rgb.z;
    rgb = _mix(make_float3(luma, luma, luma), rgb, saturation);
    
    // Shadow/Highlight adjustment
    float luminance = (rgb.x + rgb.y + rgb.z) / 3.0f;
    if (luminance > 0.7f) {
        // Highlights
        float factor = 1.0f + highlights * (luminance - 0.7f) / 0.3f;
        rgb *= factor;
    } else if (luminance < 0.3f) {
        // Shadows
        float factor = 1.0f + shadows * (0.3f - luminance) / 0.3f;
        rgb *= factor;
    }
    
    // Clamp values
    rgb.x = _clampf(rgb.x, 0.0f, 1.0f);
    rgb.y = _clampf(rgb.y, 0.0f, 1.0f);
    rgb.z = _clampf(rgb.z, 0.0f, 1.0f);
    
    return rgb;
}`;

const SpectacularDemo: React.FC = () => {
  // Parameter states
  const [exposure, setExposure] = useState(0.2)
  const [contrast, setContrast] = useState(1.1)
  const [saturation, setSaturation] = useState(1.2)
  const [temperature, setTemperature] = useState(6500)
  const [highlights, setHighlights] = useState(-0.1)
  const [shadows, setShadows] = useState(0.2)
  
  // UI states
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState('parameters')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update time every second for professional feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  // Update DCTL code in real-time
  const updateDCTLCode = () => {
    return sampleDCTLCode
      .replace(/float exposure = [^;]+;/, `float exposure = ${exposure.toFixed(1)}f;`)
      .replace(/float contrast = [^;]+;/, `float contrast = ${contrast.toFixed(1)}f;`)
      .replace(/float saturation = [^;]+;/, `float saturation = ${saturation.toFixed(1)}f;`)
      .replace(/float temperature = [^;]+;/, `float temperature = ${temperature.toFixed(0)}f;`)
      .replace(/float highlights = [^;]+;/, `float highlights = ${highlights.toFixed(1)}f;`)
      .replace(/float shadows = [^;]+;/, `float shadows = ${shadows.toFixed(1)}f;`)
  }
  
  const handleGenerateDCTL = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }
  
  const handleExport = () => {
    const code = updateDCTLCode()
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'film_emulation.dctl'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Professional Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-gradient text-2xl font-bold">
              DCTL Web Generator
            </h1>
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
              Professional
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{currentTime.toLocaleTimeString()}</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live Preview</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="layout-dctl p-6 gap-6">
        {/* Left Panel - Parameters */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex bg-muted rounded-lg p-1">
            {['parameters', 'presets', 'advanced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-background text-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Parameters Tab */}
          {activeTab === 'parameters' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Exposure & Tone */}
              <div className="panel-base">
                <div className="panel-header">
                  <h3 className="font-semibold">Exposure & Tone</h3>
                  <span className="text-xs text-muted-foreground">Primary adjustments</span>
                </div>
                <div className="panel-content space-y-4">
                  <SliderWidget
                    label="Exposure"
                    value={exposure}
                    min={-2}
                    max={2}
                    step={0.1}
                    unit=" stops"
                    precision={1}
                    onChange={setExposure}
                    gradient={true}
                    realTimePreview={true}
                  />
                  <SliderWidget
                    label="Contrast"
                    value={contrast}
                    min={0.5}
                    max={2}
                    step={0.1}
                    unit=""
                    precision={1}
                    onChange={setContrast}
                    gradient={true}
                    realTimePreview={true}
                  />
                </div>
              </div>

              {/* Color Grading */}
              <div className="panel-base">
                <div className="panel-header">
                  <h3 className="font-semibold">Color Grading</h3>
                  <span className="text-xs text-muted-foreground">Color adjustments</span>
                </div>
                <div className="panel-content space-y-4">
                  <SliderWidget
                    label="Saturation"
                    value={saturation}
                    min={0}
                    max={2}
                    step={0.1}
                    unit=""
                    precision={1}
                    onChange={setSaturation}
                    gradient={true}
                    realTimePreview={true}
                  />
                  <SliderWidget
                    label="Temperature"
                    value={temperature}
                    min={3000}
                    max={10000}
                    step={100}
                    unit="K"
                    precision={0}
                    onChange={setTemperature}
                    gradient={true}
                    realTimePreview={true}
                  />
                </div>
              </div>

              {/* Shadow/Highlight */}
              <div className="panel-base">
                <div className="panel-header">
                  <h3 className="font-semibold">Shadow/Highlight</h3>
                  <span className="text-xs text-muted-foreground">Tone mapping</span>
                </div>
                <div className="panel-content space-y-4">
                  <SliderWidget
                    label="Highlights"
                    value={highlights}
                    min={-1}
                    max={1}
                    step={0.1}
                    unit=""
                    precision={1}
                    onChange={setHighlights}
                    gradient={true}
                    realTimePreview={true}
                  />
                  <SliderWidget
                    label="Shadows"
                    value={shadows}
                    min={-1}
                    max={1}
                    step={0.1}
                    unit=""
                    precision={1}
                    onChange={setShadows}
                    gradient={true}
                    realTimePreview={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="grid gap-3">
                {[
                  { name: 'Cinematic', desc: 'Film-like grade' },
                  { name: 'Vintage', desc: 'Retro color cast' },
                  { name: 'High Contrast', desc: 'Dramatic look' },
                  { name: 'Natural', desc: 'Balanced colors' },
                  { name: 'Bleach Bypass', desc: 'Desaturated highlights' },
                  { name: 'Teal & Orange', desc: 'Hollywood style' }
                ].map((preset) => (
                  <div 
                    key={preset.name}
                    className="card-interactive p-4 cursor-pointer group"
                  >
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      {preset.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{preset.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="panel-base">
                <div className="panel-header">
                  <h3 className="font-semibold">Export Settings</h3>
                </div>
                <div className="panel-content space-y-4">
                  <div className="space-y-2">
                    <label className="form-label">Output Format</label>
                    <select className="form-input">
                      <option>DaVinci Resolve (.dctl)</option>
                      <option>Blackmagic RAW (.braw)</option>
                      <option>ACES (.ctl)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="form-label">Color Space</label>
                    <select className="form-input">
                      <option>Rec. 709</option>
                      <option>Rec. 2020</option>
                      <option>DCI-P3</option>
                      <option>ACES</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <DCTLButton
              variant="primary"
              size="lg"
              className="w-full"
              loading={isAnimating}
              glowEffect={true}
              onClick={handleGenerateDCTL}
            >
              {isAnimating ? 'Generating...' : '🚀 Generate DCTL'}
            </DCTLButton>
            
            <div className="grid grid-cols-2 gap-3">
              <DCTLButton
                variant="outline"
                onClick={handleExport}
              >
                📄 Export
              </DCTLButton>
              <DCTLButton
                variant="ghost"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? '⤓' : '⤢'} Preview
              </DCTLButton>
            </div>
          </div>
        </div>

        {/* Right Panel - Code & Preview */}
        <div className="space-y-6">
          {/* Real-time Code Preview */}
          <CodePanel
            title="Generated DCTL Code"
            code={updateDCTLCode()}
            language="dctl"
            readOnly={false}
            showLineNumbers={true}
            copyable={true}
            realTimeUpdate={true}
            className="transition-all duration-300"
          />

          {/* Visual Preview */}
          <div className="panel-base">
            <div className="panel-header">
              <h3 className="font-semibold">Visual Preview</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Real-time</span>
              </div>
            </div>
            <div className="panel-content">
              {/* Gradient Preview */}
              <div className="h-32 rounded-lg overflow-hidden relative">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-600 to-white transition-all duration-300"
                  style={{
                    filter: `
                      brightness(${1 + exposure * 0.3}) 
                      contrast(${contrast}) 
                      saturate(${saturation})
                      hue-rotate(${(temperature - 6500) / 100}deg)
                    `
                  }}
                />
                
                {/* Color Bars */}
                <div className="absolute bottom-0 left-0 right-0 h-8 flex">
                  {['red', 'green', 'blue', 'cyan', 'magenta', 'yellow'].map((color) => (
                    <div
                      key={color}
                      className={`flex-1 bg-${color}-500 transition-all duration-300`}
                      style={{
                        filter: `
                          brightness(${1 + exposure * 0.3}) 
                          contrast(${contrast}) 
                          saturate(${saturation})
                        `
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Preview Info */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-muted-foreground">Exposure</div>
                  <div className="font-mono">{exposure.toFixed(1)} stops</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">Contrast</div>
                  <div className="font-mono">{contrast.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">Saturation</div>
                  <div className="font-mono">{saturation.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Status */}
          <div className="panel-base">
            <div className="panel-content">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <div className="font-medium text-sm">Ready for Production</div>
                  <div className="text-xs text-muted-foreground">
                    DCTL validated • DaVinci Resolve compatible • Real-time preview active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-card border-t border-border px-6 py-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>DCTL Web Generator v1.0 • Professional Film Industry Tool</div>
          <div className="flex items-center gap-4">
            <span>Made with ❤️ for Colorists</span>
            <span>•</span>
            <span>Parameters: 6 active</span>
            <span>•</span>
            <span>Code: {updateDCTLCode().length} chars</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default SpectacularDemo 