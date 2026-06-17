import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './HabitListScreen.styles';

export default function HabitListScreen({ navigation }) {
  const [habits, setHabits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentViewStatus, setCurrentViewStatus] = useState('active'); 
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  const categories = ['All', 'Health', 'Study', 'Work', 'Mindfulness', 'Other'];

  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      loadOriginalHabits();
      setActiveDropdownId(null);
      setIsHeaderMenuOpen(false);
    });
    return unsubscribe;
  }, [navigation]);

  const loadOriginalHabits = async () => {
    setIsLoading(true);
    try {
      const cachedData = await AsyncStorage.getItem('@habits_list');
      if (cachedData) {
        setHabits(JSON.parse(cachedData));
      } else {
        setHabits([]);
      }
    } catch (error) {
      console.log('Error reading storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update habit status (Active / Pause / Archive)
  const handleUpdateStatus = async (habitId, newStatus) => {
    try {
      const cachedData = await AsyncStorage.getItem('@habits_list');
      let allHabits = cachedData ? JSON.parse(cachedData) : [];

      allHabits = allHabits.map(h => {
        if (h.id === habitId) {
          return { 
            ...h, 
            status: newStatus,
            can_checkin: newStatus === 'active',
            is_synced: false
          };
        }
        return h;
      });

      setHabits(allHabits);
      await AsyncStorage.setItem('@habits_list', JSON.stringify(allHabits));
      setActiveDropdownId(null); 
    } catch (error) {
      console.log('Error updating status:', error);
    }
  };

  // Permanently delete a habit with confirmation alert
  const handleDeleteHabit = (habitId) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const cachedData = await AsyncStorage.getItem('@habits_list');
              let allHabits = cachedData ? JSON.parse(cachedData) : [];
              
              const updatedList = allHabits.filter(h => h.id !== habitId);
              
              setHabits(updatedList);
              await AsyncStorage.setItem('@habits_list', JSON.stringify(updatedList));
              setActiveDropdownId(null);
            } catch (error) {
              console.log('Error deleting habit:', error);
            }
          }
        }
      ]
    );
  };

  // Generate action menu options dynamically based on current context status
  const getAvailableStatusOptions = (status) => {
    const currentStatus = status || 'active';
    let options = [];
    
    switch (currentStatus.toLowerCase()) {
      case 'active':
        options = [
          { id: 'paused', label: 'Pause' },
          { id: 'archived', label: 'Archive' }
        ];
        break;
      case 'paused':
        options = [
          { id: 'active', label: 'Resume' },
          { id: 'archived', label: 'Archive' }
        ];
        break;
      case 'archived':
        options = [
          { id: 'active', label: 'Restore' }
        ];
        break;
      default:
        options = [];
    }

    // Always append the Delete option at the end of the context dropdown
    return [...options, { id: 'delete', label: 'Delete', isDestructive: true }];
  };

  const filteredHabits = habits.filter(item => {
    const matchCategory = selectedCategory === 'All' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchStatus = (item.status || 'active').toLowerCase() === currentViewStatus.toLowerCase();
    return matchCategory && matchStatus;
  });

  const renderCategoryIcon = (categoryType) => {
    switch(categoryType?.toLowerCase()) {
      case 'health':
        return (
          <View style={styles.iconDropletBase}>
            <View style={styles.iconDropletTip} />
            <View style={styles.iconDropletRound} />
          </View>
        );
      case 'study':
        return (
          <View style={styles.iconBookContainer}>
            <View style={styles.iconBookLeftPage} />
            <View style={styles.iconBookRightPage} />
          </View>
        );
      case 'mindfulness':
        return (
          <View style={styles.iconMeditationContainer}>
            <View style={styles.iconMeditationHead} />
            <View style={styles.iconMeditationTorso} />
            <View style={styles.iconMeditationBaseLine} />
          </View>
        );
      case 'work':
        return (
          <View style={styles.iconWorkBriefcase}>
            <View style={styles.iconBriefcaseHandle} />
          </View>
        );
      default:
        return <Text style={styles.iconStarDefaultText}>★</Text>;
    }
  };

  const getPriorityStyleMapping = (priorityStr) => {
    switch (priorityStr?.toLowerCase()) {
      case 'low':
        return { bg: '#EFF6FF', text: '#1E40AF', label: 'Low Priority', stripe: '#3B82F6' };
      case 'high':
        return { bg: '#E6F4EA', text: '#137333', label: 'High Priority', stripe: '#137333' };
      case 'medium':
      default:
        return { bg: '#FEFCE8', text: '#854D0E', label: 'Medium Priority', stripe: '#F59E0B' };
    }
  };

  const renderHabitItem = ({ item }) => {
    const currentStatus = item.status || 'active';
    const isDropdownVisible = activeDropdownId === item.id;
    const priTheme = getPriorityStyleMapping(item.priority);
    const availableOptions = getAvailableStatusOptions(currentStatus);

    const isStudy = item.category?.toLowerCase() === 'study';
    const categoryBadgeBg = isStudy ? '#D6E6FE' : '#D1E7DD';
    const categoryBadgeText = isStudy ? '#3B82F6' : '#2D4A3E';

    return (
      <View style={styles.cardOuterContainer}>
        <TouchableOpacity 
          style={styles.habitCardWrapper}
          onPress={() => navigation && navigation.navigate('CreateHabit', { habitId: item.id })}
          activeOpacity={0.9}
        >
          <View style={[styles.cardLeftStripe, { backgroundColor: priTheme.stripe }]} />
          
          <View style={styles.cardMainContentContainer}>
            <View style={styles.leftMetaContainer}>
              <View style={[styles.iconCircleBadge, currentStatus !== 'active' && styles.iconCircleBadgePaused]}>
                {renderCategoryIcon(item.category)}
              </View>
            </View>
            
            <View style={styles.cardTextGroup}>
              <Text style={[styles.habitTitleLabel, currentStatus !== 'active' && styles.textMuted]} numberOfLines={1}>
                {item.name}
              </Text>
              
              <View style={styles.cardBadgesRow}>
                <View style={[styles.miniMetaBadge, { backgroundColor: categoryBadgeBg }]}>
                  <Text style={[styles.miniMetaBadgeText, { color: categoryBadgeText }]}>{item.category}</Text>
                </View>
                <View style={[styles.miniMetaBadge, { backgroundColor: '#EAEAEA' }]}>
                  <Text style={[styles.miniMetaBadgeText, { color: '#5F6368' }]}>{item.frequency}</Text>
                </View>
              </View>

              <View style={styles.priorityCapsuleRow}>
                <View style={[styles.figmaPriorityCapsuleBase, { backgroundColor: priTheme.bg }]}>
                  <Text style={[styles.figmaPriorityCapsuleText, { color: priTheme.text }]}>{priTheme.label}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardRightActionBlock}>
              <TouchableOpacity 
                style={[
                  styles.statusCapsule, 
                  currentStatus === 'active' && styles.statusCapsuleActive,
                  currentStatus === 'paused' && styles.statusCapsulePaused,
                  currentStatus === 'archived' && styles.statusCapsuleArchived
                ]}
                onPress={() => setActiveDropdownId(isDropdownVisible ? null : item.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.statusCapsuleText, 
                  currentStatus === 'active' && styles.statusTextActive,
                  currentStatus === 'paused' && styles.statusTextPaused,
                  currentStatus === 'archived' && styles.statusTextArchived
                ]}>
                  {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.figmaChevronRightContainer}>
                <View style={styles.figmaChevronLineTop} />
                <View style={styles.figmaChevronLineBottom} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isDropdownVisible && availableOptions.length > 0 && (
          <View style={[
            styles.cardDropdownListMenu, 
            { height: availableOptions.length * 36 + 8 }
          ]}>
            {availableOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.cardDropdownOptionItem}
                onPress={() => {
                  if (option.id === 'delete') {
                    handleDeleteHabit(item.id);
                  } else {
                    handleUpdateStatus(item.id, option.id);
                  }
                }}
              >
                <Text style={[
                  styles.cardDropdownOptionText, 
                  option.isDestructive && { color: '#DC2626', fontWeight: 'bold' }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <TouchableWithoutFeedback 
        onPress={() => {
          setActiveDropdownId(null);
          setIsHeaderMenuOpen(false);
        }}
      >
        <View style={{ flex: 1 }}>
          
          {/* TOP HEADER */}
          <View style={styles.globalTopNavigationHeader}>
            <TouchableOpacity style={styles.headerLeftArrowButton} onPress={() => navigation && navigation.goBack()}>
              <Text style={styles.headerArrowSymbol}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerMainTitleText}>My Habits</Text>
            
            <View style={styles.headerRightActionGroup}>
              <TouchableOpacity 
                style={styles.headerActionIconBtn} 
                onPress={() => navigation && navigation.navigate('CreateHabit')}
              >
                <Text style={styles.headerPlusIconSymbol}>+</Text>
              </TouchableOpacity>
              
              <View style={{ position: 'relative' }}>
                <TouchableOpacity 
                  style={styles.headerActionIconBtn}
                  onPress={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                >
                  <Text style={styles.headerArchiveIconSymbol}>⋮</Text>
                </TouchableOpacity>

                {isHeaderMenuOpen && (
                  <View style={styles.headerStatePopoverMenu}>
                    {[
                      { id: 'active', title: 'Active Habits' },
                      { id: 'paused', title: 'Paused List' },
                      { id: 'archived', title: 'Archived List' }
                    ].map((menuItem) => (
                      <TouchableOpacity
                        key={menuItem.id}
                        style={[
                          styles.headerMenuPopoverItem,
                          currentViewStatus === menuItem.id && { backgroundColor: '#F1F5F9' }
                        ]}
                        onPress={() => {
                          setCurrentViewStatus(menuItem.id);
                          setIsHeaderMenuOpen(false);
                          setActiveDropdownId(null);
                        }}
                      >
                        <Text style={[
                          styles.headerMenuPopoverText,
                          currentViewStatus === menuItem.id && { color: '#2D4A3E', fontWeight: '700' }
                        ]}>
                          {menuItem.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* FILTER BAR */}
          <View style={styles.topFilterBarContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarScrollInner}>
              {categories.map((cat) => {
                const isCurrent = selectedCategory === cat;
                return (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.filterChipButton, isCurrent && styles.filterChipButtonActive]} 
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.filterChipText, isCurrent && styles.filterChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* HABITS FLATLIST */}
          {isLoading && habits.length === 0 ? (
            <View style={styles.loadingCenterWheel}>
              <ActivityIndicator size="large" color="#2D4A3E" />
            </View>
          ) : (
            <FlatList
              data={filteredHabits}
              keyExtractor={(item) => item.id}
              renderItem={renderHabitItem}
              contentContainerStyle={styles.listScrollContentBody}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={() => {
                setActiveDropdownId(null);
                setIsHeaderMenuOpen(false);
              }}
            />
          )}

          {/* FLOATING ACTION BUTTON */}
          <TouchableOpacity 
            style={styles.floatingActionButton} 
            onPress={() => navigation && navigation.navigate('CreateHabit')} 
            activeOpacity={0.85}
          >
            <View style={styles.fabPlusSignHorizontal} />
            <View style={styles.fabPlusSignVertical} />
          </TouchableOpacity>
          
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}