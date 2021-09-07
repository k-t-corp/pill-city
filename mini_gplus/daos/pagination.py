def get_page(mongoengine_model, extra_query_args, extra_filter_func, from_id, page_count):
    """
    Get a page of mongoengine objects from a specific id, reverse chronologically ordered

    It is assumed that the mongoengine model has an eid field (external ID)

    :param mongoengine_model: The mongoengine model (Document class) for the queried object
    :param (Dict) extra_query_args: Extra query arguments for the desired objects
    :param extra_filter_func: An extra function that takes a queried object and
                                returns whether it should be counted in the final result
    :param (str|None) from_id: Query from this specific object ID. None means to query from latest.
    :param (int) page_count: Number of objects in a page
    """
    final_query_args = extra_query_args.copy()
    if from_id:
        from_obj = mongoengine_model.objects.get(eid=from_id)
        final_query_args['id__lt'] = from_obj.id
    objects = mongoengine_model.objects(**final_query_args).order_by('-id')

    res = []
    for i, obj in enumerate(objects):
        if not extra_filter_func(obj):
            continue
        res.append(obj)
        if len(res) == page_count:
            break

    return res
