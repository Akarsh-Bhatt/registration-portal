import hashlib
import random
import logging
import math
from typing import Optional, Callable, Iterable, List, Dict, Any

logger = logging.getLogger("bloom_filter")

class BloomFilter:
    """
    Probabilistic data structure for space-efficient membership testing.
    Guarantees no false negatives: if it says an ID is not present, it is 100% unique.
    """
    def __init__(self, size: int = 65536, num_hashes: int = 5):
        self.size = size
        self.num_hashes = num_hashes
        self.bit_array = bytearray((size + 7) // 8)
        self.count = 0
        self.collisions_detected = 0

    def _get_indices(self, item: str) -> List[int]:
        # Kirsch-Mitzenmacher optimization using SHA-256 for k independent hash values
        digest = hashlib.sha256(item.encode('utf-8')).digest()
        h1 = int.from_bytes(digest[:8], byteorder='big')
        h2 = int.from_bytes(digest[8:16], byteorder='big')
        return [(h1 + i * h2) % self.size for i in range(self.num_hashes)]

    def add(self, item: str) -> None:
        """
        Add an item (Unique ID) into the Bloom filter.
        """
        for idx in self._get_indices(item):
            self.bit_array[idx // 8] |= (1 << (idx % 8))
        self.count += 1

    def contains(self, item: str) -> bool:
        """
        Returns:
            False: The item is DEFINITELY NOT in the set (guaranteed unique).
            True: The item is PROBABLY in the set (potential duplicate).
        """
        for idx in self._get_indices(item):
            if not (self.bit_array[idx // 8] & (1 << (idx % 8))):
                return False
        return True

    def __contains__(self, item: str) -> bool:
        return self.contains(item)

    def bits_set_count(self) -> int:
        return sum(bin(byte).count('1') for byte in self.bit_array)

    def estimated_false_positive_rate(self) -> float:
        if self.count == 0:
            return 0.0
        # (1 - e^(-k*n/m))^k
        exponent = - (self.num_hashes * self.count) / float(self.size)
        return float((1.0 - math.exp(exponent)) ** self.num_hashes)

    def get_stats(self) -> Dict[str, Any]:
        return {
            "capacity_bits": self.size,
            "num_hashes": self.num_hashes,
            "items_added": self.count,
            "bits_set": self.bits_set_count(),
            "collisions_avoided": self.collisions_detected,
            "estimated_false_positive_rate": round(self.estimated_false_positive_rate(), 6)
        }


class UniqueIdGenerator:
    """
    Generates 4-digit unique identifiers in the format HYP-XXXX (where XXXX is 1000-9999).
    Uses a Bloom Filter to test for duplicacy before allocating an ID.
    """
    def __init__(self, bloom_filter: Optional[BloomFilter] = None):
        self.bloom_filter = bloom_filter or BloomFilter(size=65536, num_hashes=5)

    def sync_with_existing(self, ids: Iterable[str]) -> int:
        """
        Pre-seeds the Bloom Filter with all existing registration IDs from the database.
        """
        count = 0
        for rid in ids:
            if rid and rid.startswith("HYP-"):
                self.bloom_filter.add(rid)
                count += 1
        logger.info(f"Bloom Filter synchronized with {count} existing Unique IDs.")
        return count

    def generate_unique_id(
        self, 
        exists_in_db_fn: Optional[Callable[[str], bool]] = None,
        max_attempts: int = 10000
    ) -> str:
        """
        Generates a new HYP-XXXX Unique ID.
        Checks Bloom Filter for duplicacy. If the Bloom Filter indicates a match,
        the candidate is flagged and a new candidate is generated.
        """
        attempts = 0
        while attempts < max_attempts:
            attempts += 1
            # Generate 4-digit numerical number (1000 to 9999)
            number = random.randint(1000, 9999)
            candidate = f"HYP-{number}"

            # Step 1: Check Bloom Filter for duplicacy
            if candidate in self.bloom_filter:
                self.bloom_filter.collisions_detected += 1
                logger.info(f"Bloom Filter flagged candidate '{candidate}' as probable duplicate (Attempt {attempts}). Regenerating...")
                continue

            # Step 2: Bloom Filter says DEFINITELY NOT in set!
            # Double-check database fallback if callable is provided
            if exists_in_db_fn and exists_in_db_fn(candidate):
                logger.warning(f"Database collision found for '{candidate}' despite Bloom Filter. Adding and retrying...")
                self.bloom_filter.add(candidate)
                continue

            # Successfully found a verified unique ID! Add to Bloom filter
            self.bloom_filter.add(candidate)
            logger.info(f"Generated verified Unique ID '{candidate}' using Bloom Filter in {attempts} attempt(s).")
            return candidate

        raise RuntimeError("Exhausted all attempts generating a unique HYP-XXXX ID. Range full.")

# Singleton instance
unique_id_generator = UniqueIdGenerator()
