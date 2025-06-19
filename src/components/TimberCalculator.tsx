
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimberCalculatorProps {
  onBack: () => void;
}

const TimberCalculator = ({ onBack }: TimberCalculatorProps) => {
  const [flooringInputs, setFlooringInputs] = useState({
    length: '',
    width: '',
    boardWidth: '',
    boardLength: '',
    wastage: '10'
  });
  
  const [framingInputs, setFramingInputs] = useState({
    studSpacing: '400',
    wallHeight: '',
    wallLength: '',
    plateLength: '',
    studsRequired: ''
  });
  
  const [roofingInputs, setRoofingInputs] = useState({
    roofLength: '',
    roofWidth: '',
    rafterSpacing: '450',
    overhang: '300'
  });

  const calculateFlooring = () => {
    if (!flooringInputs.length || !flooringInputs.width || !flooringInputs.boardWidth || !flooringInputs.boardLength) return null;
    
    const roomArea = parseFloat(flooringInputs.length) * parseFloat(flooringInputs.width);
    const boardArea = (parseFloat(flooringInputs.boardWidth) / 1000) * parseFloat(flooringInputs.boardLength);
    const wastageMultiplier = 1 + (parseFloat(flooringInputs.wastage) / 100);
    const boardsNeeded = Math.ceil((roomArea / boardArea) * wastageMultiplier);
    const totalArea = boardsNeeded * boardArea;
    
    return {
      roomArea: roomArea.toFixed(2),
      boardsNeeded,
      totalArea: totalArea.toFixed(2),
      costEstimate: (boardsNeeded * 25).toFixed(2) // Rough estimate at $25 per board
    };
  };

  const calculateFraming = () => {
    if (!framingInputs.wallHeight || !framingInputs.wallLength || !framingInputs.studSpacing) return null;
    
    const wallLength = parseFloat(framingInputs.wallLength);
    const studSpacing = parseFloat(framingInputs.studSpacing) / 1000; // Convert mm to m
    const studsNeeded = Math.floor(wallLength / studSpacing) + 1;
    const platesNeeded = Math.ceil(wallLength / 3.6) * 2; // Top and bottom plates, 3.6m lengths
    const nogginsNeeded = Math.ceil(studsNeeded * 2); // 2 rows of noggins
    
    return {
      studsNeeded,
      platesNeeded,
      nogginsNeeded,
      totalLinearMeters: (studsNeeded * parseFloat(framingInputs.wallHeight) + platesNeeded * 3.6 + nogginsNeeded * 0.6).toFixed(2)
    };
  };

  const calculateRoofing = () => {
    if (!roofingInputs.roofLength || !roofingInputs.roofWidth || !roofingInputs.rafterSpacing) return null;
    
    const roofLength = parseFloat(roofingInputs.roofLength);
    const roofWidth = parseFloat(roofingInputs.roofWidth);
    const rafterSpacing = parseFloat(roofingInputs.rafterSpacing) / 1000;
    const overhang = parseFloat(roofingInputs.overhang) / 1000;
    
    const rafterLength = roofWidth + (overhang * 2);
    const raftersNeeded = Math.ceil(roofLength / rafterSpacing) + 1;
    const ridgeLength = roofLength;
    const totalTimber = (raftersNeeded * rafterLength + ridgeLength).toFixed(2);
    
    return {
      raftersNeeded,
      rafterLength: rafterLength.toFixed(2),
      ridgeLength: ridgeLength.toFixed(2),
      totalTimber
    };
  };

  const flooringResults = calculateFlooring();
  const framingResults = calculateFraming();
  const roofingResults = calculateRoofing();

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/20">
              <Ruler className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Timber Calculator</h1>
              <p className="text-gray-400 text-sm">Calculate timber requirements for construction</p>
            </div>
          </div>
        </motion.div>

        {/* Calculator Tabs */}
        <Tabs defaultValue="flooring" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="flooring" className="data-[state=active]:bg-gray-700">Flooring</TabsTrigger>
            <TabsTrigger value="framing" className="data-[state=active]:bg-gray-700">Framing</TabsTrigger>
            <TabsTrigger value="roofing" className="data-[state=active]:bg-gray-700">Roofing</TabsTrigger>
          </TabsList>

          {/* Flooring Calculator */}
          <TabsContent value="flooring">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Ruler className="w-5 h-5 mr-2 text-orange-400" />
                    Flooring Calculator
                  </CardTitle>
                  <CardDescription>Calculate timber flooring requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="floor-length" className="text-white">Room Length (m)</Label>
                      <Input
                        id="floor-length"
                        type="number"
                        placeholder="Length"
                        value={flooringInputs.length}
                        onChange={(e) => setFlooringInputs({ ...flooringInputs, length: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="floor-width" className="text-white">Room Width (m)</Label>
                      <Input
                        id="floor-width"
                        type="number"
                        placeholder="Width"
                        value={flooringInputs.width}
                        onChange={(e) => setFlooringInputs({ ...flooringInputs, width: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="board-width" className="text-white">Board Width (mm)</Label>
                      <Input
                        id="board-width"
                        type="number"
                        placeholder="e.g. 130"
                        value={flooringInputs.boardWidth}
                        onChange={(e) => setFlooringInputs({ ...flooringInputs, boardWidth: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="board-length" className="text-white">Board Length (m)</Label>
                      <Input
                        id="board-length"
                        type="number"
                        placeholder="e.g. 3.6"
                        value={flooringInputs.boardLength}
                        onChange={(e) => setFlooringInputs({ ...flooringInputs, boardLength: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="wastage" className="text-white">Wastage (%)</Label>
                    <Input
                      id="wastage"
                      type="number"
                      value={flooringInputs.wastage}
                      onChange={(e) => setFlooringInputs({ ...flooringInputs, wastage: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Flooring Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {flooringResults ? (
                    <>
                      <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">{flooringResults.boardsNeeded}</div>
                          <div className="text-sm text-gray-400">Boards Needed</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Room Area:</span>
                          <span className="text-white font-medium">{flooringResults.roomArea} m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Timber:</span>
                          <span className="text-white font-medium">{flooringResults.totalArea} m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Est. Cost:</span>
                          <span className="text-white font-medium">${flooringResults.costEstimate}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      Enter measurements to see results
                    </div>
                  )}

                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-300">
                      Standard wastage is 10-15% for flooring projects.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Framing Calculator */}
          <TabsContent value="framing">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Ruler className="w-5 h-5 mr-2 text-green-400" />
                    Wall Framing Calculator
                  </CardTitle>
                  <CardDescription>Calculate wall framing timber requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="wall-height" className="text-white">Wall Height (m)</Label>
                      <Input
                        id="wall-height"
                        type="number"
                        placeholder="e.g. 2.4"
                        value={framingInputs.wallHeight}
                        onChange={(e) => setFramingInputs({ ...framingInputs, wallHeight: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wall-length" className="text-white">Wall Length (m)</Label>
                      <Input
                        id="wall-length"
                        type="number"
                        placeholder="e.g. 6.0"
                        value={framingInputs.wallLength}
                        onChange={(e) => setFramingInputs({ ...framingInputs, wallLength: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="stud-spacing" className="text-white">Stud Spacing (mm)</Label>
                    <Select value={framingInputs.studSpacing} onValueChange={(value) => setFramingInputs({ ...framingInputs, studSpacing: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="400">400mm (Standard)</SelectItem>
                        <SelectItem value="450">450mm</SelectItem>
                        <SelectItem value="600">600mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Framing Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {framingResults ? (
                    <>
                      <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{framingResults.totalLinearMeters}m</div>
                          <div className="text-sm text-gray-400">Total Linear Meters</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Studs:</span>
                          <span className="text-white font-medium">{framingResults.studsNeeded} pieces</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Plates:</span>
                          <span className="text-white font-medium">{framingResults.platesNeeded} pieces</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Noggins:</span>
                          <span className="text-white font-medium">{framingResults.nogginsNeeded} pieces</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      Enter measurements to see results
                    </div>
                  )}

                  <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-300">
                      Includes top & bottom plates plus noggins for bracing.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Roofing Calculator */}
          <TabsContent value="roofing">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Ruler className="w-5 h-5 mr-2 text-purple-400" />
                    Roof Framing Calculator
                  </CardTitle>
                  <CardDescription>Calculate roof timber requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="roof-length" className="text-white">Roof Length (m)</Label>
                      <Input
                        id="roof-length"
                        type="number"
                        placeholder="e.g. 10.0"
                        value={roofingInputs.roofLength}
                        onChange={(e) => setRoofingInputs({ ...roofingInputs, roofLength: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="roof-width" className="text-white">Roof Width (m)</Label>
                      <Input
                        id="roof-width"
                        type="number"
                        placeholder="e.g. 8.0"
                        value={roofingInputs.roofWidth}
                        onChange={(e) => setRoofingInputs({ ...roofingInputs, roofWidth: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="rafter-spacing" className="text-white">Rafter Spacing (mm)</Label>
                      <Select value={roofingInputs.rafterSpacing} onValueChange={(value) => setRoofingInputs({ ...roofingInputs, rafterSpacing: value })}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="400">400mm</SelectItem>
                          <SelectItem value="450">450mm (Standard)</SelectItem>
                          <SelectItem value="600">600mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="overhang" className="text-white">Overhang (mm)</Label>
                      <Input
                        id="overhang"
                        type="number"
                        value={roofingInputs.overhang}
                        onChange={(e) => setRoofingInputs({ ...roofingInputs, overhang: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Roofing Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {roofingResults ? (
                    <>
                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{roofingResults.totalTimber}m</div>
                          <div className="text-sm text-gray-400">Total Linear Meters</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rafters:</span>
                          <span className="text-white font-medium">{roofingResults.raftersNeeded} @ {roofingResults.rafterLength}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ridge beam:</span>
                          <span className="text-white font-medium">{roofingResults.ridgeLength}m</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      Enter measurements to see results
                    </div>
                  )}

                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-300">
                      Basic gable roof calculation. Add 10% wastage for cutting.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TimberCalculator;
