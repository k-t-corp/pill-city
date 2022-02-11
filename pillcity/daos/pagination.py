from typing import Dict, Callable, Optional, Type, List
from mongoengine import Document


def get_page(mongoengine_model: Type[Document], extra_query_args: Dict, extra_filter_func: Callable[[Document], bool],
             from_id: Optional[str], page_count: int) -> List:
    """
    Get a page of mongoengine objects from a specific id, reverse chronologically ordered
    It is assumed that the mongoengine model has an eid field (external ID)

    :param mongoengine_model: The mongoengine model (Document class) for the queried object
    :param extra_query_args: Extra query arguments for the desired objects
    :param extra_filter_func: An extra function that takes a queried object and
                                returns whether it should be counted in the final result
    :param from_id: Query from this specific object ID. None means to query from latest.
    :param page_count: Number of objects in a page
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


def poll_latest(mongoengine_model: Type[Document], extra_query_args: Dict,
                extra_filter_func: Callable[[Document], bool], to_id: Optional[str]) -> List:
    """
    Poll mongoengine objects to a specific id, reverse chronologically ordered
    It is assumed that the mongoengine model has an eid field (external ID)

    :param mongoengine_model: The mongoengine model (Document class) for the queried object
    :param extra_query_args: Extra query arguments for the desired objects
    :param extra_filter_func: An extra function that takes a queried object and
                                returns whether it should be counted in the final result
    :param to_id: Query from this specific object ID. None means to query from latest.
    """
    final_query_args = extra_query_args.copy()
    if to_id:
        to_obj = mongoengine_model.objects.get(eid=to_id)
        final_query_args['id__gt'] = to_obj.id
    objects = mongoengine_model.objects(**final_query_args).order_by('-id')

    res = []
    for i, obj in enumerate(objects):
        if not extra_filter_func(obj):
            continue
        res.append(obj)

    return res
