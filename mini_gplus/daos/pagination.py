def get_page(mongoengine_model, extra_query_args, extra_filter_func, from_created_at_ms, from_id, page_count):
    """
    Get a page of mongoengine objects from a specific creation time and id, reverse chronologically ordered

    It is assumed that the mongoengine model has two fields
        1) created_at_ms: Epoch milliseconds of the object's creation time
        2) eid: Object's ID

    :param mongoengine_model: The mongoengine model (Document class) for the queried object
    :param (Dict) extra_query_args: Extra query arguments for the desired objects
    :param extra_filter_func: An extra function that takes a queried object and
                                returns whether it should be counted in the final result
    :param (int) from_created_at_ms: Query from this specific creation time
    :param (str) from_id: Query from this specific object ID
    :param (int) page_count: Number of objects in a page
    """
    # ordering by id descending is equivalent to ordering by created_at descending
    final_query_args = extra_query_args.copy()
    if from_created_at_ms:
        # we do less than and equal to from_created_at
        # so that all objects from the same time granularity of from_id are included
        final_query_args['created_at_ms__lte'] = from_created_at_ms
    objects = mongoengine_model.objects(**final_query_args).order_by('-id')

    from_obj_index = -1
    if from_id:
        # try to find the position of from_id so that we start from index of from_id (excluding)
        for i, obj in enumerate(objects):
            if obj.eid == from_id:
                from_obj_index = i
                break

    res = []
    for i, obj in enumerate(objects):
        if from_id and i <= from_obj_index:
            continue
        if not extra_filter_func(obj):
            continue
        res.append(obj)
        if len(res) == page_count:
            break

    return res
