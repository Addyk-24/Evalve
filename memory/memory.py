
from typing import List, Dict, Any, Optional

from datetime import datetime


class MemoryGraph:
    """Simple in-memory knowledge graph for relationships"""
    
    def __init__(self):
        self.entities = {}
        self.relationships = []
    
    def add_entity(self, entity_id: str, entity_type: str, properties: Dict):
        """Add an entity to the knowledge graph"""
        self.entities[entity_id] = {
            "type": entity_type,
            "properties": properties,
            "created_at": datetime.now().isoformat()
        }
    
    def add_relationship(self, source: str, target: str, relation_type: str, properties: Dict = None):
        """Add a relationship between entities"""
        self.relationships.append({
            "source": source,
            "target": target,
            "type": relation_type,
            "properties": properties or {},
            "created_at": datetime.now().isoformat()
        })
    
    def get_related_entities(self, entity_id: str) -> List[Dict]:
        """Get entities related to a given entity"""
        related = []
        for rel in self.relationships:
            if rel["source"] == entity_id:
                if rel["target"] in self.entities:
                    related.append({
                        "entity": self.entities[rel["target"]],
                        "relationship": rel["type"],
                        "entity_id": rel["target"]
                    })
            elif rel["target"] == entity_id:
                if rel["source"] in self.entities:
                    related.append({
                        "entity": self.entities[rel["source"]],
                        "relationship": rel["type"],
                        "entity_id": rel["source"]
                    })
        return related