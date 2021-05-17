
function travel(pos){
    let new_pos = get_relative_position(pos.fixed_pos)
    //TODO: find and assign the perspective.
    pos.x = math.chain(dt).multiply(my_vel).add(pos.x).done();
    rel = math.subtract(pos.x,center);
    pos.plane = math.chain([rel[0],rel[1]]).norm().divide(math.norm(rel)).multiply(rel).add(center).done();
    pos.r = radius_alter(pos.x);
}

function dim_shift(pos_json, type='to_3d'){
    /*
    to_3d: goes from 2d screen coords to universe coords taking into
        account the window params
    from_3d: reverse op
     */
    if (type==='to_3d'){

    } else if (type==='from_3d'){

    }
}

function get_relative_to_camera(pos_vec){
    /*
    This func finds the relative position vector of star wrt camera_polar
     */
    return pos_vec.sub(p5.Vector.fromAngles(camera_polar.x,camera_polar.y,camera_polar.z))
}

function radius_alter(pos_json){
    /*
    Using similar triangles, finds the radius value at a given distance
    from a set spawn (center,spawn_plane_offset) where a radius value is
    given at random.
     */
    pos_json.relative_pos = get_relative_to_camera(pos_json.screen_pos)
    pos_json.screen_rad = (pos_json.fixed_pos.mag()*pos_json.fixed_rad)/pos_json.relative_pos.mag();
}

function spawn_by_shape(){
    /*
    Returns a random location (2d) of type p5.Vector of the
    new star based on the how the spaceship window looks!
     */
    let circ_calc = function(){return math.sqrt(math.square(h/w)*(math.square(w)-math.square(x_val-x)))}
    let [x_abs,x,y,w,h] = [math.randomInt(width),...center,window_params.w, window_params.h]
    if ((x-w/2)<=x_abs && x_abs<=(x+w/2)) {
        if (space_ship_shape === 'ellipse') {
            y_lim = circ_calc()
        } else if (space_ship_shape === 'circle') {
            h = w
            y_lim = circ_calc()
        } else if (space_ship_shape === 'rect') {
            y_lim = h/2
        }
        y_abs = [math.randomInt(y - y_lim), math.randomInt(y + y_lim, height)][math.randomInt(2)]
    } else {
        y_abs = math.randomInt(height)
    }
    let [y_rel, z_rel] = [x_abs-center[0], y_abs-center[1]]
    // TODO: extend vector till the x offset plane to get new y,z values.
    return [x_val, y_val]
}