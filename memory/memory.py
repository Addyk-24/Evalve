from typing import List, Dict, Any, Optional, Set
from datetime import datetime
import json
from collections import defaultdict, deque
import math

class MemoryGraph:
    """Enhanced knowledge graph for startup investment platform"""
    
    def __init__(self):
        self._state = "initialized" 
        self.entities = {}
        self.relationships = []
        self.entity_index = defaultdict(set)  # Index entities by type
        self.relationship_index = defaultdict(list)  # Index relationships by source
        self.reverse_relationship_index = defaultdict(list)  # Index by target
        
    def add_entity(self, entity_id: str, entity_type: str, properties: Dict):
        """Add an entity to the knowledge graph with indexing"""
        self.entities[entity_id] = {
            "type": entity_type,
            "properties": properties,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Index by type for fast lookup
        self.entity_index[entity_type].add(entity_id)
    
    def update_entity(self, entity_id: str, properties: Dict):
        """Update existing entity properties"""
        if entity_id in self.entities:
            self.entities[entity_id]["properties"].update(properties)
            self.entities[entity_id]["updated_at"] = datetime.now().isoformat()
    
    def add_relationship(self, source: str, target: str, relation_type: str, 
                        properties: Dict = None, weight: float = 1.0):
        """Add a weighted relationship between entities with indexing"""
        relationship = {
            "source": source,
            "target": target,
            "type": relation_type,
            "properties": properties or {},
            "weight": weight,
            "created_at": datetime.now().isoformat()
        }
        
        self.relationships.append(relationship)
        
        # Index for fast lookup
        self.relationship_index[source].append(relationship)
        self.reverse_relationship_index[target].append(relationship)
    
    def get_entities_by_type(self, entity_type: str) -> Dict[str, Dict]:
        """Get all entities of a specific type"""
        entity_ids = self.entity_index.get(entity_type, set())
        return {eid: self.entities[eid] for eid in entity_ids if eid in self.entities}
    
    def get_related_entities(self, entity_id: str, relation_types: List[str] = None,
                           max_depth: int = 1) -> List[Dict]:
        """Get entities related to a given entity with optional filtering"""
        if max_depth == 1:
            return self._get_direct_relations(entity_id, relation_types)
        else:
            return self._get_multi_hop_relations(entity_id, relation_types, max_depth)
    
    def _get_direct_relations(self, entity_id: str, relation_types: List[str] = None) -> List[Dict]:
        """Get directly connected entities"""
        related = []
        
        # Outgoing relationships
        for rel in self.relationship_index.get(entity_id, []):
            if relation_types and rel["type"] not in relation_types:
                continue
            if rel["target"] in self.entities:
                related.append({
                    "entity": self.entities[rel["target"]],
                    "entity_id": rel["target"],
                    "relationship": rel["type"],
                    "direction": "outgoing",
                    "weight": rel["weight"],
                    "properties": rel["properties"]
                })
        
        # Incoming relationships
        for rel in self.reverse_relationship_index.get(entity_id, []):
            if relation_types and rel["type"] not in relation_types:
                continue
            if rel["source"] in self.entities:
                related.append({
                    "entity": self.entities[rel["source"]],
                    "entity_id": rel["source"],
                    "relationship": rel["type"],
                    "direction": "incoming",
                    "weight": rel["weight"],
                    "properties": rel["properties"]
                })
        
        return related
    
    def _get_multi_hop_relations(self, entity_id: str, relation_types: List[str], 
                                max_depth: int) -> List[Dict]:
        """Get entities within max_depth hops"""
        visited = set()
        queue = deque([(entity_id, 0)])
        results = []
        
        while queue:
            current_id, depth = queue.popleft()
            
            if current_id in visited or depth >= max_depth:
                continue
                
            visited.add(current_id)
            
            # Get direct relations
            direct_relations = self._get_direct_relations(current_id, relation_types)
            
            for rel in direct_relations:
                target_id = rel["entity_id"]
                if target_id not in visited:
                    rel["depth"] = depth + 1
                    results.append(rel)
                    queue.append((target_id, depth + 1))
        
        return results
    
    def find_paths(self, source: str, target: str, max_depth: int = 3) -> List[List[str]]:
        """Find all paths between two entities"""
        paths = []
        visited = set()
        
        def dfs(current: str, path: List[str], depth: int):
            if depth > max_depth:
                return
            if current == target and len(path) > 1:
                paths.append(path[:])
                return
            if current in visited:
                return
                
            visited.add(current)
            
            for rel in self.relationship_index.get(current, []):
                if rel["target"] not in visited:
                    path.append(rel["target"])
                    dfs(rel["target"], path, depth + 1)
                    path.pop()
            
            visited.remove(current)
        
        dfs(source, [source], 0)
        return paths
    
    def get_startup_context(self, startup_id: str) -> Dict[str, Any]:
        """Get comprehensive context for a startup (specialized for your platform)"""
        if startup_id not in self.entities:
            return {}
        
        startup = self.entities[startup_id]
        context = {
            "startup": startup,
            "founders": [],
            "team_members": [],
            "investors": [],
            "competitors": [],
            "industry_peers": [],
            "similar_startups": [],
            "market_connections": [],
            "technology_stack": [],
            "partnerships": []
        }
        
        # Get all related entities
        related = self.get_related_entities(startup_id, max_depth=2)
        
        for rel in related:
            entity_type = rel["entity"]["type"]
            relationship = rel["relationship"]
            
            if entity_type == "founder" and relationship == "founded_by":
                context["founders"].append(rel)
            elif entity_type == "team_member" and relationship == "employs":
                context["team_members"].append(rel)
            elif entity_type == "investor" and relationship == "invested_by":
                context["investors"].append(rel)
            elif entity_type == "startup" and relationship == "competes_with":
                context["competitors"].append(rel)
            elif entity_type == "startup" and relationship == "similar_to":
                context["similar_startups"].append(rel)
            elif entity_type == "industry" and relationship == "operates_in":
                context["market_connections"].append(rel)
            elif entity_type == "technology" and relationship == "uses_technology":
                context["technology_stack"].append(rel)
            elif entity_type == "startup" and relationship == "partners_with":
                context["partnerships"].append(rel)
        
        return context
    
    def find_similar_startups(self, startup_id: str, similarity_threshold: float = 0.3) -> List[Dict]:
        """Find startups similar to the given startup based on graph connections"""
        if startup_id not in self.entities:
            return []
        
        startup = self.entities[startup_id]
        startup_connections = set()
        
        # Get all connected entities
        for rel in self.get_related_entities(startup_id):
            startup_connections.add((rel["entity"]["type"], rel["relationship"]))
        
        similar_startups = []
        
        # Compare with other startups
        for other_id in self.entity_index.get("startup", set()):
            if other_id == startup_id:
                continue
            
            other_connections = set()
            for rel in self.get_related_entities(other_id):
                other_connections.add((rel["entity"]["type"], rel["relationship"]))
            
            # Calculate Jaccard similarity
            intersection = len(startup_connections & other_connections)
            union = len(startup_connections | other_connections)
            
            if union > 0:
                similarity = intersection / union
                if similarity >= similarity_threshold:
                    similar_startups.append({
                        "startup_id": other_id,
                        "startup": self.entities[other_id],
                        "similarity_score": similarity,
                        "common_connections": intersection
                    })
        
        return sorted(similar_startups, key=lambda x: x["similarity_score"], reverse=True)
    
    def get_investor_portfolio_insights(self, investor_id: str) -> Dict[str, Any]:
        """Get insights about an investor's portfolio based on graph connections"""
        if investor_id not in self.entities:
            return {}
        
        portfolio_startups = []
        industries = defaultdict(int)
        stages = defaultdict(int)
        founders = set()
        
        # Get invested startups
        for rel in self.relationship_index.get(investor_id, []):
            if rel["type"] == "invested_in" and rel["target"] in self.entities:
                startup = self.entities[rel["target"]]
                portfolio_startups.append(startup)
                
                # Analyze industry distribution
                industry = startup["properties"].get("industry_sector", "Unknown")
                industries[industry] += 1
                
                # Analyze stage distribution
                stage = startup["properties"].get("stage", "Unknown")
                stages[stage] += 1
                
                # Get founders of portfolio companies
                startup_founders = self.get_related_entities(rel["target"], ["founded_by"])
                for founder_rel in startup_founders:
                    founders.add(founder_rel["entity_id"])
        
        return {
            "portfolio_size": len(portfolio_startups),
            "industry_distribution": dict(industries),
            "stage_distribution": dict(stages),
            "unique_founders": len(founders),
            "portfolio_startups": portfolio_startups
        }
    
    def build_startup_graph_from_db(self, db_manager):
        """Build the memory graph from database data"""
        print("🔄 Building memory graph from database...")
        
        # Get all startups
        startups = db_manager.get_all_startups(limit=1000)
        
        for startup in startups:
            startup_id = startup["startup_id"]
            
            # Add startup entity
            self.add_entity(
                entity_id=startup_id,
                entity_type="startup",
                properties=startup
            )
            
            # Get detailed startup info
            detailed_startup = db_manager.get_startup_profile(startup_id)
            if not detailed_startup:
                continue
            
            # Add founders
            for founder in detailed_startup.get("founders", []):
                founder_id = f"founder_{founder.get('name', '').replace(' ', '_').lower()}"
                self.add_entity(
                    entity_id=founder_id,
                    entity_type="founder",
                    properties=founder
                )
                self.add_relationship(startup_id, founder_id, "founded_by")
                
                # Add founder experience connections
                if founder.get("professional_experience"):
                    exp_id = f"experience_{founder.get('professional_experience', '').replace(' ', '_').lower()}"
                    self.add_entity(
                        entity_id=exp_id,
                        entity_type="experience",
                        properties={"description": founder.get("professional_experience")}
                    )
                    self.add_relationship(founder_id, exp_id, "has_experience")
            
            # Add industry connections
            industry = startup.get("industry_sector")
            if industry:
                industry_id = f"industry_{industry.replace(' ', '_').lower()}"
                self.add_entity(
                    entity_id=industry_id,
                    entity_type="industry",
                    properties={"name": industry}
                )
                self.add_relationship(startup_id, industry_id, "operates_in")
            
            # Add stage connections
            stage = startup.get("stage")
            if stage:
                stage_id = f"stage_{stage.replace(' ', '_').lower()}"
                self.add_entity(
                    entity_id=stage_id,
                    entity_type="stage",
                    properties={"name": stage}
                )
                self.add_relationship(startup_id, stage_id, "in_stage")
            
            # Add location connections
            city = startup.get("location_city")
            if city:
                location_id = f"location_{city.replace(' ', '_').lower()}"
                self.add_entity(
                    entity_id=location_id,
                    entity_type="location",
                    properties={"city": city, "state": startup.get("location_state")}
                )
                self.add_relationship(startup_id, location_id, "located_in")
        
        # Build similarity relationships
        self._build_similarity_relationships()
        
        print(f"✅ Memory graph built: {len(self.entities)} entities, {len(self.relationships)} relationships")
    
    def _build_similarity_relationships(self):
        """Build similarity relationships between startups"""
        startups = list(self.entity_index.get("startup", set()))
        
        for i, startup1 in enumerate(startups):
            for startup2 in startups[i+1:]:
                similarity_score = self._calculate_startup_similarity(startup1, startup2)
                
                if similarity_score > 0.3:  # Threshold for similarity
                    self.add_relationship(
                        startup1, startup2, "similar_to", 
                        properties={"similarity_score": similarity_score},
                        weight=similarity_score
                    )
    
    def _calculate_startup_similarity(self, startup1_id: str, startup2_id: str) -> float:
        """Calculate similarity between two startups"""
        if startup1_id not in self.entities or startup2_id not in self.entities:
            return 0.0
        
        startup1 = self.entities[startup1_id]["properties"]
        startup2 = self.entities[startup2_id]["properties"]
        
        similarity_factors = []
        
        # Industry similarity
        if startup1.get("industry_sector") == startup2.get("industry_sector"):
            similarity_factors.append(0.4)
        
        # Stage similarity
        if startup1.get("stage") == startup2.get("stage"):
            similarity_factors.append(0.2)
        
        # Funding stage similarity
        if startup1.get("funding_stage") == startup2.get("funding_stage"):
            similarity_factors.append(0.2)
        
        # Location similarity
        if startup1.get("location_city") == startup2.get("location_city"):
            similarity_factors.append(0.1)
        
        # Revenue range similarity
        revenue1 = startup1.get("monthly_revenue", 0) or 0
        revenue2 = startup2.get("monthly_revenue", 0) or 0
        
        if revenue1 > 0 and revenue2 > 0:
            revenue_ratio = min(revenue1, revenue2) / max(revenue1, revenue2)
            similarity_factors.append(0.1 * revenue_ratio)
        
        return sum(similarity_factors)
    
    def get_chatbot_context(self, startup_id: str, query: str) -> Dict[str, Any]:
        """Get enhanced context for chatbot responses"""
        context = self.get_startup_context(startup_id)
        
        # Add query-specific context
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["competitor", "competition", "rival"]):
            context["focus"] = "competitors"
            context["competitors"] = self.get_related_entities(
                startup_id, ["competes_with", "similar_to"], max_depth=2
            )
        
        elif any(word in query_lower for word in ["similar", "like", "comparable"]):
            context["focus"] = "similar_startups"
            context["similar_startups"] = self.find_similar_startups(startup_id)
        
        elif any(word in query_lower for word in ["founder", "team", "who"]):
            context["focus"] = "team"
        
        elif any(word in query_lower for word in ["funding", "investment", "investor"]):
            context["focus"] = "funding"
        
        elif any(word in query_lower for word in ["market", "industry", "sector"]):
            context["focus"] = "market"
        
        return context
    
    def export_graph(self) -> Dict[str, Any]:
        """Export graph for visualization or persistence"""
        return {
            "entities": self.entities,
            "relationships": self.relationships,
            "stats": {
                "total_entities": len(self.entities),
                "total_relationships": len(self.relationships),
                "entity_types": {etype: len(entities) for etype, entities in self.entity_index.items()},
                "created_at": datetime.now().isoformat()
            }
        }

# Global memory graph instance
memory_graph = MemoryGraph()