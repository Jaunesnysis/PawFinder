// Mapper used to convert recommendation results into response objects

function mapApiResponse(items, petType) {
  return items.map((item) => ({
    breedName: item.name,
    petType,
    imageLink: item.image_link || null,
    shedding: item.shedding ?? null,
    playfulness: item.playfulness ?? null,
    energy: item.energy ?? null,
    barking: item.barking ?? null,
    protectiveness: item.protectiveness ?? null,
    trainability: item.trainability ?? null,
    familyFriendly: item.family_friendly ?? null,
    grooming: item.grooming ?? null,
    otherPetsFriendly: item.other_pets_friendly ?? null,
    childrenFriendly: item.children_friendly ?? null,
    maxHeight: item.max_height ?? null,
    maxWeight: item.max_weight ?? null,
    minHeight: item.min_height ?? null,
    minWeight: item.min_weight ?? null,
  }));
}

function buildAutoFilters(payload) {
  const { petType, ...filters } = payload;

  return {
    petType,
    ...filters,
  };
}

module.exports = {
  mapApiResponse,
  buildAutoFilters,
};
