import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { MeshBrand } from '@/constants/mesh-colors';
import { Spacing } from '@/constants/theme';

type ResourceId = 'weather' | 'guides' | 'channels' | 'shelters';

const RESOURCES: {
  id: ResourceId;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  hint: string;
}[] = [
  {
    id: 'weather',
    icon: 'rainy-outline',
    title: 'Hurricane Updates',
    hint: 'Live alerts · 4 entries',
  },
  {
    id: 'guides',
    icon: 'medkit-outline',
    title: 'Emergency Guides',
    hint: 'Be prepared · 4 entries',
  },
  {
    id: 'channels',
    icon: 'radio-outline',
    title: 'Local Channels',
    hint: 'Tune in · 4 entries',
  },
  {
    id: 'shelters',
    icon: 'location-outline',
    title: 'Shelter Finder',
    hint: 'Find nearby · 4 entries',
  },
];

const RESOURCE_CONTENT: Record<
  ResourceId,
  {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    sections: {
      title: string;
      items: string[];
    }[];
  }
> = {
  weather: {
    icon: 'rainy-outline',
    title: 'Hurricane Updates',
    description: 'Important storm information saved for offline access.',
    sections: [
      {
        title: 'Before the storm',
        items: [
          'Charge phones, radios, and backup batteries.',
          'Bring outdoor objects inside or secure them.',
          'Keep drinking water and essential supplies ready.',
        ],
      },
      {
        title: 'During the storm',
        items: [
          'Stay indoors and away from windows.',
          'Do not travel through flooded roads.',
          'Follow official evacuation instructions.',
        ],
      },
    ],
  },

  guides: {
    icon: 'medkit-outline',
    title: 'Emergency Guides',
    description: 'Quick instructions for common emergency situations.',
    sections: [
      {
        title: 'Power outage',
        items: [
          'Use flashlights instead of candles when possible.',
          'Keep refrigerators and freezers closed.',
          'Unplug sensitive electronics until power returns.',
        ],
      },
      {
        title: 'Flooding',
        items: [
          'Move to higher ground if flooding is occurring.',
          'Never walk or drive through moving floodwater.',
          'Avoid downed power lines and electrical equipment.',
        ],
      },
    ],
  },

  channels: {
    icon: 'radio-outline',
    title: 'Local Channels',
    description: 'Emergency communication channels available on your device.',
    sections: [
      {
        title: 'Emergency',
        items: [
          'Monitor local emergency broadcasts when available.',
          'Keep your radio charged and accessible.',
        ],
      },
      {
        title: 'Mesh Aid',
        items: [
          'Nearby Mesh Aid devices can relay messages.',
          'Messages may continue traveling through other nearby devices.',
        ],
      },
    ],
  },

  shelters: {
    icon: 'location-outline',
    title: 'Shelter Finder',
    description: 'Nearby emergency shelters and evacuation locations.',
    sections: [
      {
        title: 'Before leaving',
        items: [
          'Bring identification and essential medications.',
          'Bring water, food, and a phone charger.',
          'Check whether the shelter accepts pets.',
        ],
      },
      {
        title: 'Important',
        items: [
          'Use official evacuation routes when available.',
          'Do not enter an area under an evacuation order.',
        ],
      },
    ],
  },
};

export default function Resources() {
  const [selectedResource, setSelectedResource] =
    useState<ResourceId | null>(null);

  if (selectedResource) {
    return (
      <ResourceDetail
        resourceId={selectedResource}
        onBack={() => setSelectedResource(null)}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>Resources</ThemedText>
            <ThemedText style={styles.subtitle}>
              Saved offline on this device
            </ThemedText>
          </View>

          <View style={styles.resourceList}>
            {RESOURCES.map((resource) => (
              <Pressable
                key={resource.id}
                onPress={() => setSelectedResource(resource.id)}
                style={({ pressed }) => [
                  styles.resourceCard,
                  pressed && styles.resourceCardPressed,
                ]}
              >
                <View style={styles.resourceIconWrap}>
                  <Ionicons
                    name={resource.icon}
                    size={22}
                    color={MeshBrand.forest}
                  />
                </View>

                <View style={styles.resourceInfo}>
                  <ThemedText style={styles.resourceTitle}>
                    {resource.title}
                  </ThemedText>

                  <ThemedText style={styles.resourceHint}>
                    {resource.hint}
                  </ThemedText>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={MeshBrand.muted}
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ResourceDetail({
  resourceId,
  onBack,
}: {
  resourceId: ResourceId;
  onBack: () => void;
}) {
  const resource = RESOURCE_CONTENT[resourceId];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={MeshBrand.forest}
            />
            <ThemedText style={styles.backText}>Resources</ThemedText>
          </Pressable>

          <View style={styles.detailHeader}>
            <View style={styles.detailIcon}>
              <Ionicons
                name={resource.icon}
                size={25}
                color={MeshBrand.forest}
              />
            </View>

            <ThemedText style={styles.detailTitle}>
              {resource.title}
            </ThemedText>

            <ThemedText style={styles.detailDescription}>
              {resource.description}
            </ThemedText>
          </View>

          <View style={styles.detailSections}>
            {resource.sections.map((section) => (
              <View key={section.title} style={styles.infoCard}>
                <ThemedText style={styles.sectionTitle}>
                  {section.title}
                </ThemedText>

                <View style={styles.itemList}>
                  {section.items.map((item) => (
                    <View key={item} style={styles.infoItem}>
                      <View style={styles.bullet} />
                      <ThemedText style={styles.itemText}>
                        {item}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MeshBrand.cream,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },

  header: {
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: MeshBrand.forest,
  },

  subtitle: {
    fontSize: 12,
    color: MeshBrand.muted,
    marginTop: 2,
  },

  resourceList: {
    gap: Spacing.three,
  },

  resourceCard: {
    minHeight: 96,
    backgroundColor: MeshBrand.card,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  resourceCardPressed: {
    opacity: 0.7,
  },

  resourceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Spacing.two,
    backgroundColor: '#EDF4ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },

  resourceInfo: {
    flex: 1,
  },

  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MeshBrand.forest,
  },

  resourceHint: {
    fontSize: 12,
    color: MeshBrand.muted,
    marginTop: 2,
  },

  // Detail screen

  detailContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },

    backButton: {
    height: 58,
    paddingHorizontal: 4,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,

    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    },

    backText: {
    fontSize: 20,
    fontWeight: '600',
    color: MeshBrand.forest,
    },

  detailHeader: {
    marginBottom: Spacing.four,
  },

  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: Spacing.two,
    backgroundColor: '#EDF4ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },

  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MeshBrand.forest,
  },

  detailDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: MeshBrand.muted,
    marginTop: 3,
  },

  detailSections: {
    gap: Spacing.three,
  },

  infoCard: {
    backgroundColor: MeshBrand.card,
    borderRadius: Spacing.four,
    padding: Spacing.three,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MeshBrand.forest,
    marginBottom: Spacing.two,
  },

  itemList: {
    gap: Spacing.two,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },

  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: MeshBrand.moss,
    marginTop: 6,
  },

  itemText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: MeshBrand.forest,
  },
});