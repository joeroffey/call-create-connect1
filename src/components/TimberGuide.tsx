
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimberGuideProps {
  onBack: () => void;
}

const TimberGuide = ({ onBack }: TimberGuideProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const timberSpecies = [
    {
      name: 'European Redwood',
      species: 'Pinus sylvestris',
      grade: 'C16, C24',
      uses: 'General construction, roofing, floor joists',
      characteristics: 'Good strength-to-weight ratio, readily available',
      cost: '£££'
    },
    {
      name: 'Douglas Fir',
      species: 'Pseudotsuga menziesii',
      grade: 'C16, C24',
      uses: 'Structural beams, posts, heavy construction',
      characteristics: 'High strength, excellent load bearing',
      cost: '££££'
    },
    {
      name: 'European Whitewood',
      species: 'Picea abies',
      grade: 'C16, C24',
      uses: 'Internal framing, studwork, general joinery',
      characteristics: 'Light colour, stable, easy to work',
      cost: '£££'
    },
    {
      name: 'Southern Yellow Pine',
      species: 'Pinus spp.',
      grade: 'C16, C24',
      uses: 'Structural framing, decking, fencing',
      characteristics: 'High density, strong, pressure treated options',
      cost: '£££'
    }
  ];

  const timberGrades = [
    {
      grade: 'C16',
      strength: '16 N/mm²',
      modulus: '8,800 N/mm²',
      uses: 'General construction, domestic buildings',
      description: 'Standard structural grade for most residential applications'
    },
    {
      grade: 'C24',
      strength: '24 N/mm²',
      modulus: '11,000 N/mm²',
      uses: 'Heavy duty construction, commercial buildings',
      description: 'Higher strength grade for demanding structural applications'
    },
    {
      grade: 'C35',
      strength: '35 N/mm²',
      modulus: '13,000 N/mm²',
      uses: 'Engineered structures, large spans',
      description: 'Premium grade for critical structural elements'
    }
  ];

  const regulations = [
    {
      title: 'Building Regulations Part A',
      section: 'Structure',
      requirement: 'Timber must meet minimum strength classes and be properly graded',
      compliance: 'Use CE marked timber with appropriate strength class'
    },
    {
      title: 'BS 5268',
      section: 'Structural Use of Timber',
      requirement: 'Design calculations and load requirements',
      compliance: 'Follow code requirements for spans and loading'
    },
    {
      title: 'Fire Safety',
      section: 'Part B',
      requirement: 'Fire resistance and treatment requirements',
      compliance: 'Use appropriate fire retardant treatments where required'
    }
  ];

  const standardSizes = [
    { category: 'Sawn Timber', sizes: ['38x89mm', '38x140mm', '38x184mm', '38x235mm', '47x100mm', '47x150mm', '47x200mm'] },
    { category: 'Planed Timber', sizes: ['32x75mm', '32x125mm', '32x175mm', '32x225mm', '44x94mm', '44x144mm', '44x194mm'] },
    { category: 'Engineered', sizes: ['I-Joists 200mm', 'I-Joists 302mm', 'I-Joists 356mm', 'Glulam beams', 'LVL beams'] }
  ];

  return (
    <div className="h-full rounded-xl bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center border border-orange-500/20">
              <BookOpen className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-1xl md:text-2xl font-bold text-white">UK Timber Guide</h1>
              <p className="text-gray-400 text-sm">Complete reference for timber construction in the UK</p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search timber species, grades, or regulations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Guide Content */}
        <Tabs defaultValue="species" className="w-full">
          <TabsList className="w-full h-full flex flex-wrap md:grid md:grid-cols-4 gap-2 bg-gray-800 p-2 rounded-lg">
            <TabsTrigger value="species" className="flex-1 md:flex-none data-[state=active]:bg-gray-700">
              Species
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex-1 md:flex-none data-[state=active]:bg-gray-700">
              Grades
            </TabsTrigger>
            <TabsTrigger value="regulations" className="flex-1 md:flex-none data-[state=active]:bg-gray-700">
              Regulations
            </TabsTrigger>
            <TabsTrigger value="sizes" className="flex-1 md:flex-none data-[state=active]:bg-gray-700">
              Sizes
            </TabsTrigger>
          </TabsList>


          <TabsContent value="species">
            <div className="grid gap-4 mt-4 md:grid-cols-2">
              {timberSpecies.map((timber, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">{timber.name}</CardTitle>
                    <CardDescription className="italic">{timber.species}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-400">Grades: </span>
                      <span className="text-white">{timber.grade}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Uses: </span>
                      <span className="text-white">{timber.uses}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Characteristics: </span>
                      <span className="text-white">{timber.characteristics}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Cost: </span>
                      <span className="text-emerald-400">{timber.cost}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="grades">
            <div className="grid gap-4 mt-4">
              {timberGrades.map((grade, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Grade {grade.grade}</span>
                      <span className="text-sm text-emerald-400">{grade.strength}</span>
                    </CardTitle>
                    <CardDescription>{grade.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-400">Bending Strength: </span>
                        <span className="text-white">{grade.strength}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Modulus of Elasticity: </span>
                        <span className="text-white">{grade.modulus}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Typical Uses: </span>
                      <span className="text-white">{grade.uses}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regulations">
            <div className="grid gap-4 mt-4">
              {regulations.map((reg, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">{reg.title}</CardTitle>
                    <CardDescription>{reg.section}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-400">Requirement: </span>
                      <span className="text-white">{reg.requirement}</span>
                    </div>
                    <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                      <span className="text-sm text-gray-400">Compliance: </span>
                      <span className="text-emerald-300">{reg.compliance}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sizes">
            <div className="grid gap-4 mt-4 md:grid-cols-3">
              {standardSizes.map((category, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.sizes.map((size, sizeIndex) => (
                        <div key={sizeIndex} className="text-sm text-gray-300 bg-gray-700/30 rounded px-3 py-2">
                          {size}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TimberGuide;
