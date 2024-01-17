from .allocation import *
from .config import *
from .notification import *
from .project import *
from .proposal import *
from .shortlist import *
from .user import *

# Rebuild Pydantic models in package root
# to prevent circular calls to model_rebuild().
# Make sure to import all models must be imported from this package root,
# not directly from its submodules.
User.model_rebuild()
UserReadWithAllocation.model_rebuild()
Project.model_rebuild()
ProjectReadWithProposal.model_rebuild()
ProjectReadWithAllocations.model_rebuild()
ProjectReadWithDetails.model_rebuild()
ProjectCreateWithDetails.model_rebuild()
ProjectUpdateWithDetails.model_rebuild()
ProjectDetail.model_rebuild()
ProjectDetailReadWithTemplate.model_rebuild()
Proposal.model_rebuild()
ProposalRead.model_rebuild()
Allocation.model_rebuild()
AllocationRead.model_rebuild()
Shortlist.model_rebuild()
Notification.model_rebuild()
