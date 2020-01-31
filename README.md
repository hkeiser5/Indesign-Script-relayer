/* JavaScript relayer Indd script 
written by Heather C Keiser, copyright 2020.
------------------------------------------------------------------

This script when run will reorgainize all text and pic frames into the following layers:

relayer-master_imagery: This layer will contain any frames & imagery that is contained on the master spreads

relayer-imagery: This layer will contain any frames & imagery on any pages/spreads

relayer-text_and_vectors: This layer will contain any text, vectors, possible logos (any groups of polygons are assumed to be logos)

relayer-markers_and_folios: This layer will contain text from master pages, and any text that contains a page marker or section marker in it from regular pages/spreads

Original layers are not deleted as there may be guides and such that get moved that are not included in this script. If this script is run on a file that already contains layers with these names, the items are just moved to these layers and no new layers are created.

------------------------------------------------------------------------------------*/
